(function () {
  'use strict';
  
  const SSO_API_URL = 'https://unified-api.creatorcommerce.shop/integrations/superfiliate/magic-link';
  const DEBUG = false;
  const INIT_DELAY = 320;
  
  const log = (...a) => { if (DEBUG) console.log('[CC-Storefront]', ...a); };
  const warn = (...a) => { if (DEBUG) console.warn('[CC-Storefront]', ...a); };
  const err = (...a) => { if (DEBUG) console.error('[CC-Storefront]', ...a); };
  
  let isProcessing = false;
  let currentObserver = null;
  
  // Get email and domain
  function getEmail() {
      const el = document.getElementById('sf-email');
      return el?.textContent?.trim() || '';
  }

  function getMyShopifyDomain() {
      const el = document.getElementById('sf-myshopify');
      return el?.textContent?.trim() || '';
  }
  
  async function callSSOApi(email, myshopifyDomain) {
      try {
          log('🔡 Calling SSO API');
          
          const res = await fetch(
              `${SSO_API_URL}?email=${encodeURIComponent(email)}&myshopifyDomain=${myshopifyDomain}`,
              {
                  method: 'GET'
              }
          );
          
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const data = await res.json();
          log('✅ SSO API response received');
          
          return data?.link || null;
      } catch (e) {
          err('❌ SSO API failed:', e);
          return null;
      }
  }
  
  function activateButton(btn, email, domain) {
      if (btn.__ccActivated) {
          log('ℹ️ Button already activated');
          return;
      }
      
      log('🎯 Activating button');
      
      // Make clickable
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s ease';
      
      // Hover effect
      btn.addEventListener('mouseenter', () => {
          if (!btn.__ssoLock) {
              btn.style.opacity = '0.85';
              btn.style.transform = 'scale(1.02)';
          }
      });
      
      btn.addEventListener('mouseleave', () => {
          if (!btn.__ssoLock) {
              btn.style.opacity = '1';
              btn.style.transform = 'scale(1)';
          }
      });
      
      // Click handler
      btn.addEventListener('click', async () => {
          if (btn.__ssoLock) return;
          
          const prevText = btn.textContent;
          btn.__ssoLock = true;
          btn.textContent = 'Connecting...';
          btn.style.pointerEvents = 'none';
          
          try {
              const link = await callSSOApi(email, domain);
              
              if (link) {
                  log('🚀 Opening SSO link');
                  window.open(link, '_blank', 'noopener,noreferrer');
              } else {
                  warn('⚠️ No link returned');
              }
          } catch (e) {
              err('❌ Click error:', e);
          }
          
          btn.textContent = prevText;
          btn.style.pointerEvents = '';
          btn.__ssoLock = false;
      });
      
      btn.__ccActivated = true;
      log('✅ Button activated');
  }
  
  function init() {
      if (isProcessing) {
          log('⚠️ Already processing');
          return;
      }
      
      log('🚀 Init started');
      isProcessing = true;
      
      const email = getEmail();
      const domain = getMyShopifyDomain();
      
      if (!email || !domain) {
          warn('⚠️ Missing email or domain');
          isProcessing = false;
          return;
      }
      
      log('✅ Found credentials:', { email, domain });
      
      const btn = document.getElementById('cc-button');
      if (!btn) {
          warn('⚠️ Button not found, will retry');
          isProcessing = false;
          return;
      }
      
      log('✅ Button found');
      
      // Test API then activate
      callSSOApi(email, domain).then(link => {
          if (link) {
              log('✅ API test successful');
              activateButton(btn, email, domain);
          } else {
              warn('⚠️ No link from API - hiding button');
              btn.style.display = 'none';
          }
          isProcessing = false;
      }).catch(() => {
          warn('⚠️ API test failed - hiding button');
          btn.style.display = 'none';
          isProcessing = false;
      });
  }
  
  function whenElementsReady(cb) {
      // Check if our required elements exist
      const email = document.getElementById('sf-email');
      const button = document.getElementById('cc-button');
      
      if (email || button) {
          log('✅ Elements found immediately');
          cb();
          return;
      }
      
      log('⏳ Waiting for elements...');
      if (currentObserver) currentObserver.disconnect();
      
      currentObserver = new MutationObserver((_, o) => {
          const email2 = document.getElementById('sf-email');
          const button2 = document.getElementById('cc-button');
          
          if (email2 || button2) {
              log('✅ Elements appeared');
              o.disconnect();
              currentObserver = null;
              cb();
          }
      });
      
      currentObserver.observe(document.body, {
          childList: true,
          subtree: true
      });
      
      // Give up after 10 seconds
      setTimeout(() => {
          if (currentObserver) {
              warn('⚠️ Timeout waiting for elements');
              currentObserver.disconnect();
              currentObserver = null;
          }
      }, 10000);
  }
  
  function start() {
      log('🎬 Start called');
      
      whenElementsReady(() => {
          log('🎯 Elements ready, waiting for delay...');
          setTimeout(() => {
              log('⏰ Init delay complete, running init');
              init();
          }, INIT_DELAY);
      });
  }
  
  // SPA Navigation tracking (like the working example)
  let lastPathname = location.pathname;
  
  function handleNavigationChange(newPathname) {
      if (newPathname === lastPathname) return;
      
      log('🔄 Navigation detected:', newPathname);
      lastPathname = newPathname;
      isProcessing = false;
      
      if (currentObserver) {
          currentObserver.disconnect();
          currentObserver = null;
      }
      
      if (newPathname.includes('/portal')) {
          setTimeout(() => start(), 180);
      }
  }
  
  // Poll for navigation changes
  setInterval(() => {
      handleNavigationChange(location.pathname);
  }, 120);
  
  // Intercept history API
  const _ps = history.pushState;
  const _rs = history.replaceState;
  
  history.pushState = function(...args) {
      _ps.apply(this, args);
      setTimeout(() => handleNavigationChange(location.pathname), 60);
  };
  
  history.replaceState = function(...args) {
      _rs.apply(this, args);
      setTimeout(() => handleNavigationChange(location.pathname), 60);
  };
  
  // Listen for popstate
  window.addEventListener('popstate', () => {
      setTimeout(() => handleNavigationChange(location.pathname), 60);
  });
  
  // Initial boot
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
      start();
  }
  
  log('📦 Script loaded');
  
})();