# Development Server 404 Errors - Fix Instructions

## 🚨 **Issue**: Next.js static files returning 404 errors

The development server is running but Next.js static files are not being served properly. This is likely due to service worker caching or browser cache issues.

## 🔧 **Fixes Applied:**

### ✅ **1. Disabled Service Worker in Development**
- Service worker now only registers in production (not localhost)
- Prevents interference with Next.js development server

### ✅ **2. Updated Service Worker**
- Added exclusions for all Next.js development files
- Service worker now skips `/_next/static/` files completely
- Updated cache version to v5

### ✅ **3. Created Cache Clearing Script**
- Added `public/clear-sw.js` for manual cache clearing

## 🛠️ **Manual Fix Steps:**

### **Step 1: Clear Browser Cache**
1. Open Developer Tools (F12)
2. Go to **Application** tab
3. Click **Storage** → **Clear site data**
4. Or use **Ctrl+Shift+R** for hard refresh

### **Step 2: Clear Service Worker Cache**
1. Open Developer Tools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. Click **Unregister** for any registered service workers
5. Go to **Storage** → **Clear storage** → **Clear site data**

### **Step 3: Restart Development Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm run dev
```

### **Step 4: Alternative - Use Clear Script**
1. Open browser console (F12)
2. Navigate to `http://localhost:3000/clear-sw.js`
3. Copy and paste the script content into console
4. Press Enter to execute

## 🎯 **Expected Results:**

After clearing cache and restarting:
- ✅ No more 404 errors for Next.js static files
- ✅ Service worker only active in production
- ✅ Development server serves files normally
- ✅ Clean console without resource errors

## 🔍 **If Issues Persist:**

1. **Check if port 3000 is free:**
   ```bash
   netstat -ano | findstr :3000
   ```

2. **Kill any processes using port 3000:**
   ```bash
   taskkill /f /im node.exe
   ```

3. **Clear .next directory:**
   ```bash
   Remove-Item -Recurse -Force .next
   ```

4. **Restart with clean install:**
   ```bash
   pnpm install
   pnpm run dev
   ```

The development server should now work properly without 404 errors! 🚀

