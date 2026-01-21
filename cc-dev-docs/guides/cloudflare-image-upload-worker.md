# Cloudflare Images Upload Worker Documentation

## Worker URL
```
https://image-upload-worker.muddy-poetry-10bc.workers.dev
```

## Endpoint
```
POST /upload-image
```

## How It Works

The worker acts as a proxy that:
1. Receives an image file from the browser
2. Uploads it to Cloudflare Images (keeping API tokens secure server-side)
3. Returns the public CDN URL of the uploaded image

## Request Format

**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**Body:** FormData with a `file` field containing the image

## Response Format

**Success (200):**
```json
{
  "url": "https://imagedelivery.net/[account-hash]/[image-id]/public"
}
```

**Error (4xx/5xx):**
```json
{
  "error": "Error message here"
}
```

---

## JavaScript Implementation

### Simple Version
```javascript
async function uploadToCloudflare(file) {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch('https://image-upload-worker.muddy-poetry-10bc.workers.dev/upload-image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'Cloudflare upload failed');
  }

  const data = await response.json();
  return data.url; // Returns the CDN URL
}
```

### Configurable Version
```javascript
// Configuration
const CLOUDFLARE_WORKER_URL = 'https://image-upload-worker.muddy-poetry-10bc.workers.dev';

async function uploadToCloudflareImages(blob, filename) {
  const formData = new FormData();
  formData.append('file', blob, filename);
  
  const response = await fetch(`${CLOUDFLARE_WORKER_URL}/upload-image`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errorData.error || 'Cloudflare upload failed');
  }

  const result = await response.json();
  return result.url;
}
```

---

## Full Usage Example (with File Input)

```javascript
// 1. Get file from input
const fileInput = document.getElementById('image-input');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  
  try {
    // 2. Upload to Cloudflare
    const imageUrl = await uploadToCloudflare(file);
    console.log('Image uploaded:', imageUrl);
    
    // 3. Use the URL (display preview, save to database, etc.)
    document.getElementById('preview').src = imageUrl;
    
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload image');
  }
});
```

---

## With Cropper.js Integration

```javascript
// After cropping with Cropper.js
function applyCrop() {
  const canvas = cropper.getCroppedCanvas({
    width: 400,
    height: 400,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });

  canvas.toBlob(async (blob) => {
    try {
      const filename = `cropped-image-${Date.now()}.jpg`;
      const imageUrl = await uploadToCloudflare(blob, filename);
      
      // Update preview
      document.getElementById('preview').src = imageUrl;
      
      // Save URL to your backend/API
      await saveToAPI(imageUrl);
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, 'image/jpeg', 0.9);
}

async function uploadToCloudflare(fileOrBlob, filename) {
  const formData = new FormData();
  formData.append('file', fileOrBlob, filename || fileOrBlob.name);

  const response = await fetch('https://image-upload-worker.muddy-poetry-10bc.workers.dev/upload-image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.url;
}
```

---

## HTML Structure Example

```html
<!-- Hidden file input -->
<input type="file" 
       id="image-input" 
       accept="image/*" 
       style="display: none;">

<!-- Clickable upload area -->
<label for="image-input" class="upload-area">
  <div id="preview-container">
    <img id="preview" src="" alt="Preview" style="display: none;">
    <span id="placeholder">Click to upload an image</span>
  </div>
</label>

<!-- Upload button alternative -->
<button onclick="document.getElementById('image-input').click()">
  Upload Image
</button>
```

---

## Notes

1. **CORS**: The worker handles CORS, so you can call it from any domain
2. **File Size**: Check Cloudflare Images limits (typically 10MB max)
3. **Supported Formats**: JPEG, PNG, GIF, WebP
4. **No Authentication Required**: The worker itself handles Cloudflare API authentication internally
5. **CDN URLs**: Returned URLs are served via Cloudflare's CDN with automatic optimization

---

## To Use in Another Project

1. Use the same worker URL: `https://image-upload-worker.muddy-poetry-10bc.workers.dev/upload-image`
2. Copy the `uploadToCloudflare()` function above
3. Send images as FormData with the `file` field
4. Parse the JSON response and use `data.url` for the CDN URL

