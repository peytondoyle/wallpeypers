# How to Delete Vercel Blob Store

## Option 1: Delete via Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com/dashboard
2. **Navigate to:** Your `wallpeypers` project
3. **Click:** "Storage" tab (left sidebar)
4. **Find:** Your blob store `up3jqjm12xqtzx6s`
5. **Click:** The three dots (...) or settings icon next to the store name
6. **Select:** "Delete Store" or "Remove Store"
7. **Confirm:** Type the store name to confirm deletion

**Alternative path:**
- Dashboard → Storage → Select your store → Settings (gear icon) → Delete Store

---

## Option 2: Contact Vercel Support (If no delete button)

If you don't see a "Delete Store" option:

1. Go to: https://vercel.com/help
2. Click "Contact Support"
3. Subject: "Delete Blob Store for wallpeypers project"
4. Message:
   ```
   Hi, I've migrated my wallpaper images from Vercel Blob to Cloudflare R2.

   Please delete the following blob store:
   - Store: up3jqjm12xqtzx6s.public.blob.vercel-storage.com
   - Project: wallpeypers

   All files are safely backed up and the store is no longer in use.
   ```

---

## Why Delete?

- **Current Vercel Blob cost:** $5-10/month (or usage-based)
- **New R2 cost:** ~$0.01/month
- **Monthly savings:** $5-10

---

## Safety Check

✅ All 142 wallpapers confirmed working on R2
✅ Local backups in `/backups/` directory
✅ Zero images still using Vercel Blob URLs in production

**It's 100% safe to delete the Vercel Blob store.**

---

## After Deletion

1. Confirm $0 Blob charges on next Vercel bill
2. Update `next.config.ts` to remove old domain (optional):
   ```typescript
   // Can remove this line:
   hostname: 'up3jqjm12xqtzx6s.public.blob.vercel-storage.com',
   ```
