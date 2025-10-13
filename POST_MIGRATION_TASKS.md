# Post-Migration Tasks for Wallpeypers

## ✅ Completed Automatically
- [x] Removed `/api/ok` endpoint (no longer needed)
- [x] Verified all 142 wallpapers using R2 URLs
- [x] Cleaned up 31 unrecoverable legacy images

---

## 🔧 Manual Tasks Required

### 1. Delete Legacy Vercel Blob Storage

**Why:** Save $5-10/month and avoid confusion

**How:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your wallpeypers project → Storage tab
3. Find the Blob store: `up3jqjm12xqtzx6s.public.blob.vercel-storage.com`
4. Click "Delete" or "Remove"
   - OR use CLI: `vercel blob rm <blob-store-name>`

**Note:** Keep your local `/backups/` folder as a safety net

---

### 2. Configure R2 CORS Settings

**Why:** Allow browsers to load images from your R2 bucket

**How:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2 → Your bucket (`peyton-media`)
3. Go to Settings → CORS Policy
4. Add this configuration:

```json
[
  {
    "AllowedOrigins": [
      "https://wallpeypers.vercel.app",
      "https://wallpeypers-*.vercel.app",
      "http://localhost:3000"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["content-type", "authorization"],
    "MaxAgeSeconds": 3600
  }
]
```

**OR via Wrangler CLI:**
```bash
wrangler r2 bucket cors set peyton-media --cors-config cors.json
```

---

### 3. Set Up R2 Lifecycle Rules (Optional)

**Why:** Auto-delete temporary upload files after 7 days

**How:**
1. In Cloudflare Dashboard → R2 → Your bucket
2. Go to Settings → Lifecycle Rules
3. Add rule:
   - **Name:** Delete temp files
   - **Prefix:** `tmp/`
   - **Action:** Delete after 7 days

**Note:** Only needed if you use temporary upload paths

---

### 4. Custom Domain for R2 (Optional)

**Why:** Nicer URLs like `https://media.louton.com/wallpeypers/` instead of `pub-...r2.dev`

**How:**
1. In Cloudflare Dashboard → R2 → Your bucket
2. Go to Settings → Custom Domain
3. Add: `media.louton.com` (or subdomain of your choice)
4. Update `.env.vercel.production`:
```bash
NEXT_PUBLIC_R2_PUBLIC_BASE=https://media.louton.com
```
5. Update `next.config.ts` remotePatterns:
```typescript
{
  protocol: 'https',
  hostname: 'media.louton.com',
}
```

**Benefits:**
- Cleaner URLs
- Better branding
- Cloudflare CDN caching
- Custom cache headers

---

## 📊 Current State

- **Total Wallpapers:** 142
- **Storage:** Cloudflare R2 (peyton-media bucket)
- **Public URL:** `https://pub-a0f86dca503044cda0278eb6bafbe7d9.r2.dev`
- **Latest Deploy:** `wallpeypers-hhxzfx3hl-peyton-doyle.vercel.app`

---

## 💰 Cost Savings

**Before (Vercel Blob):**
- ~$5-10/month for storage
- Limited free tier

**After (Cloudflare R2):**
- $0.015/GB/month storage (~142 images = ~700MB = $0.01/month)
- First 10GB free
- No egress fees
- **Estimated savings: $5-10/month**

---

## 🚀 Next Steps

1. Delete Vercel Blob storage (priority)
2. Configure R2 CORS (important for browser access)
3. Optional: Set up lifecycle rules
4. Optional: Add custom domain

All migration scripts saved in `/scripts/` for future reference.
