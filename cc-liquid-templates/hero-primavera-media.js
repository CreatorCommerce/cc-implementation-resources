  // Comprehensive mute button system
  class MuteButtonManager {
    constructor() {
      this.init();
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setupMuteButtons());
      } else {
        this.setupMuteButtons();
      }
    }

    setupMuteButtons() {
      
      // Step 1: Force mute ALL videos by default
      this.forceMuteAllVideos();
      
      // Step 2: Ensure every video has a working mute button
      this.ensureAllVideosHaveMuteButtons();
      
    }

    recheckMuteButtons() {
      
      // Force mute any new videos
      this.forceMuteAllVideos();
      
      // Ensure all videos have working mute buttons
      this.ensureAllVideosHaveMuteButtons();
      
    }

    forceMuteAllVideos() {
      const allVideos = document.querySelectorAll('video');
      
      allVideos.forEach((video, index) => {
        // Force mute every video
        video.muted = true;
        video.setAttribute('muted', '');
        
        // Ensure autoplay compatibility
        if (video.hasAttribute('autoplay')) {
          video.setAttribute('playsinline', '');
        }
        
      });
    }

    ensureAllVideosHaveMuteButtons() {
      const allVideos = document.querySelectorAll('video');
      
      allVideos.forEach((video, index) => {
        
        // Find the container for this video
        const container = this.findVideoContainer(video);
        
        if (!container) {
          return;
        }
        
        // Check if container already has a mute button
        let existingButton = container.querySelector('.mute-toggle');
        
        // If no button exists, create one
        if (!existingButton) {
          existingButton = this.createMuteButton();
          container.style.position = 'relative';
          container.appendChild(existingButton);
        }
        
        // Always rebind the button to ensure it works (this handles both new and existing buttons)
        this.bindMuteButton(existingButton);
        
      });
    }

    findVideoContainer(video) {
      // Try different container selectors
      const selectors = [
        '.unique-testimonial__image',
        '.media-wrapper',
        '.story__slide',
        '.swiper-slide'
      ];
      
      
      for (const selector of selectors) {
        const container = video.closest(selector);
        if (container) {
          return container;
        }
      }
      
      // Fallback: use parent element
      const parentContainer = video.parentElement;
      return parentContainer;
    }

    createMuteButton() {
      const button = document.createElement('button');
      button.className = 'mute-toggle';
      button.textContent = '🔇';
      button.setAttribute('type', 'button');
      
      // Apply consistent styling
      Object.assign(button.style, {
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: '10',
        padding: '6px 10px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
      });
      
      return button;
    }

    bindMuteButton(button) {
      
      const container = button.closest('.unique-testimonial__image, .media-wrapper, .story__slide, .swiper-slide') || button.parentElement;
      
      const video = container ? container.querySelector('video') : null;
      
      if (!video) {
        return;
      }
      
      // Remove any existing event listeners to prevent duplicates
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // Ensure video is muted initially
      video.muted = true;
      video.setAttribute('muted', '');
      newButton.textContent = '🔇';
      
      
      // Add click event listener to the new button
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        
        // Toggle mute state
        video.muted = !video.muted;
        
        // Update button text
        newButton.textContent = video.muted ? '🔇' : '🔊';
        
        
        // If unmuting, try to play the video (regardless of autoplay status)
        if (!video.muted) {
          video.play().catch(err => {
            // Video play failed, continue silently
          });
        }
      });
      
      // Add event listeners to handle video state changes
      video.addEventListener('loadstart', () => {
        // Ensure it's muted when it starts loading
        video.muted = true;
        video.setAttribute('muted', '');
        newButton.textContent = '🔇';
      });
      
    }
  }

  // Initialize the mute button manager
  const muteManager = new MuteButtonManager();
  
  // Watch for dynamically added videos (like lazy-loaded videos)
  const observer = new MutationObserver((mutations) => {
    let shouldRecheck = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if a video was added
            if (node.tagName === 'VIDEO' || node.querySelector('video')) {
              shouldRecheck = true;
            }
          }
        });
      }
    });
    
    if (shouldRecheck) {
      setTimeout(() => {
        muteManager.recheckMuteButtons();
      }, 100);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  document.addEventListener("DOMContentLoaded", function () {
    const videoWrappers = document.querySelectorAll(".unique-video-slider-item");

    videoWrappers.forEach(wrapper => {
      const playIcon = wrapper.querySelector(".play-icon");
      const pauseIcon = wrapper.querySelector(".pause-icon");
      const videoContainer = wrapper.querySelector(".unique-testimonial__image");
      const lazyContainer = videoContainer?.querySelector(".lazy-video-container");

      let video = wrapper.querySelector("video");

      // Skip image-only slides
      if (!lazyContainer && !video) return;

      const createLazyVideo = () => {
        const videoUrl = lazyContainer?.getAttribute("data-video-src");
        const posterUrl = lazyContainer?.getAttribute("data-poster");
        if (!videoUrl) return null;

        const lazyVideo = document.createElement("video");

        Object.assign(lazyVideo.style, {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          position: "absolute",
          top: "0",
          left: "0",
          borderRadius: "var(--video-border-radius, 0px)",
          border: "var(--video-border, 0px solid transparent)"
        });

        // Attributes for autoplay inline on mobile
        lazyVideo.setAttribute("playsinline", "");
        lazyVideo.setAttribute("muted", "");
        lazyVideo.setAttribute("autoplay", "");
        lazyVideo.setAttribute("loop", "");
        lazyVideo.setAttribute("preload", "none");
        if (posterUrl) lazyVideo.setAttribute("poster", posterUrl);

        // ALSO set properties (needed on iOS Safari sometimes)
        lazyVideo.playsInline = true;
        lazyVideo.muted = true;
        lazyVideo.autoplay = true;
        lazyVideo.loop = true;

        const source = document.createElement("source");
        source.setAttribute("src", videoUrl);
        source.setAttribute("type", "video/mp4");
        lazyVideo.appendChild(source);

        lazyVideo.classList.add("lazy-loaded-video");

        lazyContainer.innerHTML = ""; // Clear existing image
        lazyContainer.appendChild(lazyVideo);

        return lazyVideo;
      };

      const bindVideoEvents = (vid) => {
        if (!vid) return;

        vid.addEventListener("play", () => {
          videoContainer?.classList.add("playing");
        });

        vid.addEventListener("pause", () => {
          videoContainer?.classList.remove("playing");
        });
      };

      // If initial video exists, bind now and ensure properties
      if (video) {
        video.playsInline = true;
        video.muted = true;
        bindVideoEvents(video);
      }

      // PLAY icon handlers
      const onPlayTap = async (e) => {
        e.preventDefault?.();
        e.stopPropagation?.();

        // If lazy, create video first
        if (!video && lazyContainer) {
          video = createLazyVideo();
          bindVideoEvents(video);
        }
        if (!video) return;

        try {
          await video.play();
        } catch (err) {
          console.error("Play error:", err);
        }
      };
      playIcon?.addEventListener("click", onPlayTap);
      playIcon?.addEventListener("touchstart", onPlayTap, { passive: false });

      // PAUSE icon handlers (call video.pause() directly)
      const onPauseTap = (e) => {
        e.preventDefault?.();
        e.stopPropagation?.(); // prevent slider / wrapper handlers
        const vid = video || wrapper.querySelector("video");
        if (vid) vid.pause();
      };
      pauseIcon?.addEventListener("click", onPauseTap);
      pauseIcon?.addEventListener("touchstart", onPauseTap, { passive: false });

      // Make sure pause icon is clickable above overlays/sliders
      if (pauseIcon) {
        pauseIcon.style.pointerEvents = "auto";
        pauseIcon.style.touchAction = "manipulation";
      }
      if (playIcon) {
        playIcon.style.pointerEvents = "auto";
        playIcon.style.touchAction = "manipulation";
      }

      // Mobile: Show pause icon briefly on touch (not when tapping icons)
      const isMobileTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches && window.innerWidth <= 768;

      if (isMobileTouch) {
        wrapper.addEventListener("touchstart", (e) => {
          // If tapping on play/pause icons (or their children), do nothing here
          if (
            (pauseIcon && (e.target === pauseIcon || pauseIcon.contains(e.target))) ||
            (playIcon && (e.target === playIcon || playIcon.contains(e.target)))
          ) {
            return;
          }

          // CSS will handle showing/hiding pause icon via .playing class and :hover
        }, { passive: true });
      }
    });
  });
  document.addEventListener("DOMContentLoaded", function () {
    const videoWrappers = document.querySelectorAll(".story__slide");

    videoWrappers.forEach(wrapper => {
      const playIcon = wrapper.querySelector(".play-icon");
      const pauseIcon = wrapper.querySelector(".pause-icon");
      const videoContainer = wrapper.querySelector(".unique-testimonial__image");
      const lazyContainer = videoContainer?.querySelector(".lazy-video-container");

      let video = wrapper.querySelector("video");

      // Skip image-only slides
      if (!lazyContainer && !video) return;

      const createLazyVideo = () => {
        const videoUrl = lazyContainer?.getAttribute("data-video-src");
        const posterUrl = lazyContainer?.getAttribute("data-poster");
        if (!videoUrl) return null;

        const lazyVideo = document.createElement("video");

        Object.assign(lazyVideo.style, {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          position: "absolute",
          top: "0",
          left: "0",
          borderRadius: "var(--video-border-radius, 0px)",
          border: "var(--video-border, 0px solid transparent)"
        });

        lazyVideo.setAttribute("playsinline", "");
        lazyVideo.setAttribute("muted", "");
        lazyVideo.setAttribute("autoplay", "");
        lazyVideo.setAttribute("loop", "");
        lazyVideo.setAttribute("preload", "none");
        if (posterUrl) lazyVideo.setAttribute("poster", posterUrl);

        const source = document.createElement("source");
        source.setAttribute("src", videoUrl);
        source.setAttribute("type", "video/mp4");
        lazyVideo.appendChild(source);

        lazyVideo.classList.add("lazy-loaded-video");

        lazyContainer.innerHTML = ""; // Clear existing image
        lazyContainer.appendChild(lazyVideo);

        return lazyVideo;
      };

      const bindVideoEvents = (vid) => {
        if (!vid) return;

        vid.addEventListener("play", () => {
          videoContainer?.classList.add("playing");
        });

        vid.addEventListener("pause", () => {
          videoContainer?.classList.remove("playing");
        });
      };

      // If initial video exists, bind now
      if (video) {
        bindVideoEvents(video);
      }

      playIcon?.addEventListener("click", async () => {
        // If lazy, create video first
        if (!video && lazyContainer) {
          video = createLazyVideo();
          bindVideoEvents(video);
        }

        if (!video) return;

        try {
          await video.play();
        } catch (err) {
          console.error("Play error:", err);
        }
      });

      pauseIcon?.addEventListener("click", () => {
        if (video) {
          video.pause();
        }
      });

      // Mobile: Show pause icon briefly on touch
      if (window.matchMedia("(hover: none) and (pointer: coarse)").matches && window.innerWidth <= 768) {
        wrapper.addEventListener("touchstart", async (e) => {
          if (pauseIcon?.contains(e.target)) {
            pauseIcon.click();
            return;
          }

          // CSS will handle showing/hiding pause icon via .playing class and :hover
        });
      }
    });
  });
  function getContrastYIQ(hexColor) {
    hexColor = hexColor.replace("#", "");
    if (hexColor.length === 3) {
      hexColor = hexColor.split('').map(c => c + c).join('');
    }
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
  }

  document.querySelectorAll('#hero-section').forEach(section => {
    const autoContrast = section.dataset.autoContrast === "true";
    if (!autoContrast) return;

    const bgColor = window.getComputedStyle(section).backgroundColor;

    // Convert rgb to hex
    const rgbToHex = (rgb) => {
      const result = rgb.match(/\d+/g);
      if (!result) return '#ffffff';
      return (
        "#" +
        result
          .slice(0, 3)
          .map((x) => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")
      );
    };

    const hexColor = rgbToHex(bgColor);
    const textColor = getContrastYIQ(hexColor);

    section.querySelectorAll('.dynamic-text').forEach(el => {
      // Skip badge text - it has its own contrast calculation
      if (el.classList.contains('badge-text')) return;
      el.style.color = textColor;
    });

    // Apply same contrast color to star fills
    section.querySelectorAll('.star path').forEach(star => {
      star.style.fill = textColor;
    });
  });
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector('.unique-video-slider-list');
  const slidermain = slider ? slider.closest(".unique-video-slider") : null;
  if (!slider || !slidermain) return;

  const items = Array.from(slider.querySelectorAll(".unique-video-slider-item"));
  const originalItemCount = items.length; // Store original count before cloning
  
  // Calculate slideWidth including margins
  function getSlideWidth() {
    if (items.length === 0) return 0;
    const item = items[0];
    const rect = item.getBoundingClientRect();
    const style = window.getComputedStyle(item);
    const marginLeft = parseFloat(style.marginLeft) || 0;
    const marginRight = parseFloat(style.marginRight) || 0;
    return rect.width + marginLeft + marginRight;
  }
  
  let slideWidth = getSlideWidth();

  // ----------------------------
  // Active item update (no blinking)
  // ----------------------------
  let lastActiveIndex = null;

  function updateActiveItemdrag() {
    const wrapperRect = slidermain.getBoundingClientRect();
    const visibleCenter = wrapperRect.left + wrapperRect.width / 2;
    const offsetPercent = 0.15;
    const threshold = 5; // 5px threshold to prevent false fading
    let activeItem = null;
    let minDiff = Infinity;

    // Query fresh DOM items instead of using cached array
    const currentItems = Array.from(slider.querySelectorAll(".unique-video-slider-item"));

    currentItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const offset = rect.width * offsetPercent;
      const triggerPoint = rect.right - offset;
      const diff = Math.abs(visibleCenter - triggerPoint);

      if (diff < minDiff) {
        minDiff = diff;
        activeItem = { item, index };
      }
    });

    if (!activeItem) return;

    const activeIndex = activeItem.index;

    // ✅ Only update when slide actually changes
    if (activeIndex === lastActiveIndex) return;
    lastActiveIndex = activeIndex;

    currentItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const wrapperLeft = wrapperRect.left;
      const leftDiff = rect.left - wrapperLeft;

      item.classList.remove("fade-left", "fade-out-left", "is-active", "slide-forward");

      if (index === activeIndex) {
        item.classList.add("is-active");
      } else if (leftDiff < -threshold) {
        // Use threshold to prevent false fading on first item
        item.classList.add("fade-left");
      } else if (index > activeIndex) {
        item.classList.add("slide-forward");
      }
    });
  }

  // ----------------------------
  // Smooth scroll helper
  // ----------------------------
  function smoothScrollBy(element, distance, duration, callback) {
    const start = element.scrollLeft;
    const startTime = performance.now();

    function scroll() {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeInOutQuad = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;

      element.scrollLeft = start + distance * easeInOutQuad;
      updateActiveItemdrag();

      if (progress < 1) {
        requestAnimationFrame(scroll);
      } else {
        if (callback) callback();
      }
    }

    requestAnimationFrame(scroll);
  }

  // ----------------------------
  // Infinite loop
  // ----------------------------
  let infiniteLoopEnabled = false;

  function createInfiniteLoop() {
    if (infiniteLoopEnabled) return;
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.classList.remove("is-active", "fade-left", "fade-out-left", "slide-forward");
      slider.appendChild(clone);
    });
    infiniteLoopEnabled = true;
    // Initialize active item state after clones are created
    updateActiveItemdrag();
  }

  function handleInfiniteScroll() {
    if (!infiniteLoopEnabled) return;
    const currentScroll = slider.scrollLeft;
    const totalWidth = slideWidth * originalItemCount; // Use original count for loop calculations
    
    // Reset scroll position when we've scrolled past the original items
    // Use modulo to maintain the exact position within the loop
    if (currentScroll >= totalWidth) {
      const offset = currentScroll % totalWidth;
      slider.scrollLeft = offset;
      updateActiveItemdrag();
    } else if (currentScroll < 0) {
      // Handle backward scrolling (shouldn't happen but just in case)
      slider.scrollLeft = totalWidth + (currentScroll % totalWidth);
      updateActiveItemdrag();
    }
  }

  function initInfiniteLoop() {
    if (window.innerWidth > 1100 && items.length > 1) {
      createInfiniteLoop();
      infiniteLoopEnabled = true;
    } else {
      infiniteLoopEnabled = false;
    }
  }

  // ----------------------------
  // Right arrow → next slide
  // ----------------------------
  const rightArrow = document.querySelector(".right-arrow");
  const fadeDuration = 300;
  const smoothDuration = 500;

  function twoStepScroll(distance) {
    setTimeout(() => {
      smoothScrollBy(slider, distance, smoothDuration, () => {
        handleInfiniteScroll(); 
      });
    }, fadeDuration);
  }

  if (rightArrow) {
    rightArrow.addEventListener("click", () => {
      twoStepScroll(slideWidth);
    });
  }

  // ----------------------------
  // Dragging
  // ----------------------------
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('dragging');
    slidermain.classList.add('dragslider');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      slider.classList.remove('dragging');
      slidermain.classList.remove('dragslider');
      handleInfiniteScroll();
    }
  });

  slider.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      slider.classList.remove('dragging');
      slidermain.classList.remove('dragslider');
      updateActiveItemdrag();
      handleInfiniteScroll();
    }
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX);
    slider.scrollLeft = scrollLeft - walk;
    updateActiveItemdrag();
  });

  // ----------------------------
  // Wheel scroll
  // ----------------------------
  slider.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      slider.scrollLeft += e.deltaX;
      updateActiveItemdrag();
      handleInfiniteScroll();
    }
  }, { passive: false });

  // ----------------------------
  // Init
  // ----------------------------
  slider.querySelectorAll('img').forEach(img => img.setAttribute('draggable', false));
  initInfiniteLoop();
  window.addEventListener("resize", () => {
    slideWidth = getSlideWidth();
    updateActiveItemdrag();
    initInfiniteLoop();
  });
  setTimeout(updateActiveItemdrag, 100);

  // periodic loop check
  setInterval(() => {
    if (window.innerWidth > 1100) {
      handleInfiniteScroll();
    }
  }, 1000);
});
document.addEventListener("DOMContentLoaded", function () {
  // Only initialize if we're in social mode
  if (!document.querySelector('.story__slider')) {
    return;
  }

  const totalSlides = document.querySelectorAll('.story__slide').length;

  const slider = new Swiper(".story__slider", {
  speed: 100,
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  },
  watchSlidesProgress: true,
  loop: totalSlides > 1,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false
  },
  slidesPerView: 1,
  spaceBetween: 0,
  navigation: {
    nextEl: ".story__next",
    prevEl: ".story__prev",
  },
  pagination: {
    el: '.story__pagination',
    renderBullet: function (index, className) {
      return '<div class="' + className + '"><div class="swiper-pagination-progress"></div></div>';
    }
  },
  on: {
    slideChangeTransitionStart(swiper) {
      // Stop all progress bar animations
      let allBullets = document.querySelectorAll('.story__slider .swiper-pagination-progress');
      allBullets.forEach(bullet => {
        gsap.killTweensOf(bullet);
      });
    },
    slideChangeTransitionEnd(swiper) {
      let allBullets = document.querySelectorAll('.story__slider .swiper-pagination-progress');
      
      // Set completed bullets to 100%
      allBullets.forEach((bullet, index) => {
        if (index < swiper.realIndex) {
          gsap.set(bullet, { width: '100%' });
        } else if (index > swiper.realIndex) {
          gsap.set(bullet, { width: '0%' });
        }
      });
      
      // Animate current bullet
      let currentBullet = allBullets[swiper.realIndex];
      if (currentBullet) {
        gsap.set(currentBullet, { width: '0%' });
        gsap.to(currentBullet, { 
          width: '100%', 
          duration: swiper.params.autoplay.delay / 1000,
          ease: 'none'
        });
      }

      // Reset video if present
      let activeSlide = document.querySelectorAll('.story__slider .swiper-slide')[swiper.realIndex];
      if (activeSlide && activeSlide.querySelector('video')) {
        activeSlide.querySelector('video').currentTime = 0;
      }
    },
    init(swiper) {
      // Initialize all progress bars to 0%
      let allBullets = document.querySelectorAll('.story__slider .swiper-pagination-progress');
        gsap.set(allBullets, { width: '0%' });
      
      // Force start autoplay and progress bar after a short delay
      setTimeout(() => {
        swiper.autoplay.start();
        let firstBullet = allBullets[0];
        if (firstBullet) {
          gsap.to(firstBullet, { 
            width: '100%', 
            duration: swiper.params.autoplay.delay / 1000,
            ease: 'none'
          });
        }
      }, 100);
    },
    autoplayStart(swiper) {
      // This handles when autoplay restarts (not first load)
      let allBullets = document.querySelectorAll('.story__slider .swiper-pagination-progress');
      let currentBullet = allBullets[swiper.realIndex];
      if (currentBullet) {
        gsap.killTweensOf(currentBullet);
        gsap.set(currentBullet, { width: '0%' });
        gsap.to(currentBullet, { 
          width: '100%', 
          duration: swiper.params.autoplay.delay / 1000,
          ease: 'none'
        });
      }
    }
  }
});

// Function to attach autoplay control events to videos
function attachVideoEvents(video) {
  if (video.__eventsBound) return; // prevent double-binding
  video.__eventsBound = true;

  video.addEventListener('play', () => {
    // Pause the slide timer when video is playing
    slider.autoplay.stop();
    
    // Pause the progress bar animation
    let allBullets = document.querySelectorAll('.story__slider .swiper-pagination-progress');
    let currentBullet = allBullets[slider.realIndex];
    if (currentBullet) {
      gsap.pauseAll();
    }
  });
  
  video.addEventListener('pause', () => {
    // Resume the slide timer when video is paused
    slider.autoplay.start();
    
    // Resume the progress bar animation
    gsap.resumeAll();
  });
  
  video.addEventListener('ended', () => {
    // Resume when video ends
    slider.autoplay.start();
    gsap.resumeAll();
  });
}

// Attach to any videos already present
document.querySelectorAll('.story__slide video').forEach(attachVideoEvents);

// Watch for dynamically injected videos (from lazy-video-container click)
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.tagName === 'VIDEO') {
        attachVideoEvents(node);
      } else if (node.querySelectorAll) {
        node.querySelectorAll('video').forEach(attachVideoEvents);
      }
    });
  });
});

// Observe only inside the slider
// observer.observe(document.querySelector('.story__slider'), {
//   childList: true,
//   subtree: true
// });

const sliderEl = document.querySelector('.story__slider');
if (sliderEl) {
  observer.observe(sliderEl, {
    childList: true,
    subtree: true
  });
}

function isClickOnControl(el) {
  if (!el) return false;
  const controlTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
  let node = el;

  while (node && node !== sliderEl && node.nodeType === 1) {
    // tag-based interactive elements
    if (controlTags.includes(node.tagName)) return true;

    // explicit attribute to opt-out
    if (node.hasAttribute && node.hasAttribute('data-no-skip')) return true;

    // class-name heuristics (catch common control class names)
    const cls = node.className || '';
    if (typeof cls === 'string' && /(^|\s)(play|pause|mute|volume|control|controls|btn|button|icon|seek|timeline|progress|vjs-|plyr|video-controls|story__controls|story__play)/i.test(cls)) {
      return true;
    }

    node = node.parentElement;
  }

  return false;
}


if (sliderEl) {
  sliderEl.addEventListener('click', function (e) {
    // only consider primary button / normal taps
    if (e.button && e.button !== 0) return;

    // if the click originated from a control (button, link, input, or marked element), don't skip
    if (isClickOnControl(e.target)) {
      return;
    }

    // Optional: if you'd like a 50/50 left-right split (Instagram style), change width/3 → width/2 below.
    const rect = sliderEl.getBoundingClientRect();
    const x = e.clientX - rect.left; // click/tap X position relative to slider
    const width = rect.width || 1;

    // Left third → previous, Right two-thirds → next (adjust as you like)
    if (x < width / 3) {
      slider.slidePrev();
    } else {
      slider.slideNext();
    }
  }, { passive: true });
}

}); // End of DOMContentLoaded
