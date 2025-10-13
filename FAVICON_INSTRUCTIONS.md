# 🎨 Generate Favicons for All Your Projects

## Quick Start (5 minutes to do all 15 projects!)

### Step 1: Run the Generator

```bash
cd ~/Documents/Development/wallpeypers
node scripts/generate-project-favicons.mjs
```

This will automatically create `public/icon.svg` in each project with the perfect emoji!

---

## Icon Preview

Here's what each project will get:

| Project | Icon | Color |
|---------|------|-------|
| wallpeypers | 🎨 | Pink |
| tabby | 🐱 | Orange |
| wine-de-louton | 🍷 | Burgundy |
| imposter | 🎭 | Red |
| wordle | 🟩 | Green |
| sundial | ☀️ | Gold |
| plants-de-louton | 🪴 | Green |
| housewives-wiki | 👑 | Gold |
| louton-plant-guide | 🌿 | Forest green |
| episodic | 📺 | Blue |
| tori-in-rva | 📍 | Teal |
| blank-slate | ⬜ | White |
| shelf-life | 📚 | Brown |
| scan-receipt-edge | 🧾 | Green |
| peytons-books | 📕 | Red |

---

## Step 2: Deploy Each Project (Optional - Automated)

Want to deploy all at once? Run this helper script:

```bash
# Create deployment script
cat > ~/Documents/Development/deploy-all-favicons.sh <<'EOF'
#!/bin/bash

projects=(
  "wallpeypers"
  "tabby"
  "wine-de-louton"
  "imposter"
  "episodic"
  "housewives-wiki"
  "shelf-life"
  "plants-de-louton"
)

for proj in "${projects[@]}"; do
  echo "🚀 Deploying $proj..."
  cd ~/Documents/Development/$proj

  if [ -f "public/icon.svg" ]; then
    git add public/icon.svg
    git commit -m "chore: add favicon for Vercel dashboard"
    git push origin main
    echo "✅ $proj deployed"
  else
    echo "⚠️  $proj: No favicon found"
  fi
done

echo "🎉 All done!"
EOF

chmod +x ~/Documents/Development/deploy-all-favicons.sh
```

Then run:
```bash
~/Documents/Development/deploy-all-favicons.sh
```

---

## Step 3: Verify in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Wait 5-10 minutes after deployment
3. Refresh the page
4. Icons should now appear next to each project! 🎉

---

## Customization

### Change an emoji:

Edit `scripts/generate-project-favicons.mjs` and update the project's emoji:

```javascript
{ name: 'your-project', emoji: '🚀', color: '#0070F3' },
```

Then run the script again.

### Different colors:

Update the `color` field for any project to change the background.

---

## Manual Method (If script doesn't work)

For any project:

1. Go to https://favicon.io/emoji-favicons/
2. Pick your emoji
3. Download the zip
4. Extract to `public/` folder
5. Deploy

---

## Troubleshooting

**Icons not showing?**
- Make sure `public/icon.svg` or `public/favicon.ico` exists
- Deploy the project (Vercel needs to see the file)
- Wait 10 minutes for cache to clear
- Hard refresh the Vercel dashboard (Cmd+Shift+R)

**Script failed for a project?**
- Check if project exists in `~/Documents/Development/`
- Check if project has a `public/` folder
- Try manual method for that specific project

---

## Benefits

✅ Professional look in Vercel dashboard
✅ Easy to identify projects at a glance
✅ Consistent branding across all apps
✅ Shows in browser tabs when deployed
✅ Free and takes 5 minutes total!

---

Ready to make your Vercel dashboard look amazing? Run the script! 🚀
