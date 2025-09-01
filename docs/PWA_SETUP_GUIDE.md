# PWA Setup Guide

This guide will help you convert your Next.js Meetings Hub application into a Progressive Web App (PWA).

## Overview

A Progressive Web App (PWA) provides a native app-like experience in web browsers, including offline functionality, push notifications, and the ability to install the app on devices.

## Prerequisites

- Next.js application (already set up)
- Node.js and npm installed

## Step-by-Step Implementation

### 1. Install PWA Package

Install the required dependencies:

```bash
npm install next-pwa
npm install --save-dev webpack
```

### 2. Configure Next.js for PWA

Update your `next.config.js` (or create it if it doesn't exist):

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})

module.exports = withPWA({
  // Your existing Next.js config
})
```

### 3. Create Web App Manifest

Create `public/manifest.json` with your app metadata:

```json
{
  "name": "Chairman Office - Work Management System",
  "short_name": "Chairman Office",
  "description": "Modern meeting management application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### 4. Add PWA Icons

Create a `public/icons/` folder and add the following icon sizes:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

**Icon Requirements:**
- Use your app logo/branding
- Icons should be square
- Consider creating maskable icons for better Android integration
- PNG format recommended

### 5. Update Root Layout

Add PWA meta tags to your `app/layout.tsx`:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Chairman Office" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Chairman Office" />
        <meta name="description" content="Modern meeting management application" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### 6. Create Offline Fallback Page

Create `public/fallback.html` for offline scenarios:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chairman Office - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: #f0f0f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }
        h1 { color: #333; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 20px; }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #5a67d8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Retry</button>
    </div>
</body>
</html>
```

### 7. Add PWA Features (Optional)

#### Install Prompt Component

Create a component to prompt users to install the app:

```tsx
// components/install-prompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Install Chairman Office</h3>
          <p className="text-sm text-gray-600">Add to your home screen for quick access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPrompt(false)}>
            Later
          </Button>
          <Button onClick={handleInstall}>
            Install
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 8. Testing & Verification

#### Chrome DevTools
1. Open Chrome DevTools
2. Go to **Application** tab
3. Check **Manifest** section for any errors
4. Verify **Service Workers** are registered
5. Test offline functionality in **Network** tab

#### Lighthouse Audit
1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Run a **Progressive Web App** audit
4. Address any issues found

#### Testing Checklist
- [ ] App installs on desktop/mobile
- [ ] Works offline (shows fallback page)
- [ ] Icons display correctly
- [ ] Manifest loads without errors
- [ ] Service worker registers successfully
- [ ] Lighthouse PWA score > 90

## Additional Considerations

### Push Notifications
For push notifications, you'll need to:
- Set up Firebase Cloud Messaging (FCM)
- Create notification permission requests
- Handle notification clicks and actions

### Background Sync
For background data synchronization:
- Implement Background Sync API
- Queue failed requests for retry
- Sync data when connection is restored

### App Updates
For handling app updates:
- Show update notifications to users
- Implement skip waiting functionality
- Cache busting for new versions

## Troubleshooting

### Common Issues

**Service Worker not registering:**
- Check console for errors
- Ensure HTTPS (required for PWA)
- Verify service worker file exists

**Icons not displaying:**
- Check icon file paths in manifest
- Ensure all icon sizes exist
- Verify MIME types are correct

**Install prompt not showing:**
- PWA criteria must be met
- User must not have dismissed it recently
- App must not already be installed

### Debugging Tools

- Chrome DevTools > Application
- Lighthouse PWA audit
- PWA Builder (pwabuilder.com)
- Manifest validator tools

## Deployment Notes

### Vercel Deployment
- PWA works automatically on Vercel
- Ensure environment variables are set
- Service worker will be generated automatically

### Custom Server
- Configure HTTPS
- Set proper MIME types for manifest
- Ensure service worker is served correctly

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

*Last updated: [Current Date]*
*For questions or issues, please refer to the project documentation or create an issue.*