# Project Icons Guide

## Icon Suggestions by Project

| Project | Icon/Emoji | Theme | Color |
|---------|------------|-------|-------|
| **wallpeypers** | 🖼️ 🎨 🌸 | Wallpapers/art | Pastel pink/purple |
| **tabby** | 🐱 📑 🗂️ | Tab manager | Orange/yellow |
| **wine-de-louton** | 🍷 🍇 🥂 | Wine collection | Burgundy/purple |
| **imposter** | 🎭 👤 🕵️ | Mystery/games | Red/black |
| **wordle** | 🟩 🔤 📝 | Word game | Green/yellow |
| **sundial** | ☀️ 🕐 ⏰ | Time/calendar | Gold/orange |
| **plants-de-louton** | 🌿 🪴 🌱 | Plant guide | Green |
| **housewives-wiki** | 👑 💎 📺 | TV show wiki | Pink/gold |
| **louton-plant-guide** | 🌺 🍃 🌻 | Plant encyclopedia | Green/botanical |
| **episodic** | 📺 🎬 🍿 | TV episode tracker | Blue/purple |
| **tori-in-rva** | 📍 🏙️ 🗺️ | Location guide | Teal/red |
| **blank-slate** | ⬜ 📄 ✨ | Starter template | White/minimal |
| **shelf-life** | 📚 📖 🛒 | Book/product tracker | Brown/beige |
| **scan-receipt-edge** | 🧾 📱 💳 | Receipt scanner | Blue/green |
| **peytons-books** | 📕 🤓 ✍️ | Book collection | Warm brown/red |

---

## Quick Setup: Add Icons to Your Projects

### Method 1: Emoji Favicons (Fastest - 30 seconds per project)

For Next.js projects, add to `src/app/layout.tsx` or `src/pages/_app.tsx`:

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Name',
  icons: {
    icon: '/favicon.ico',
  },
}
```

Then create a simple emoji favicon using this online tool:
1. Go to: https://favicon.io/emoji-favicons/
2. Pick your emoji (use suggestions above)
3. Download and replace `public/favicon.ico`

### Method 2: Custom SVG Icons (Better quality)

Create `public/icon.svg` with your design:

```svg
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" fill="#yourcolor"/>
  <text x="32" y="42" font-size="32" text-anchor="middle">🎨</text>
</svg>
```

### Method 3: Automated Script (Recommended)

I'll create a script that generates all favicons at once!

---

## Icon Generation Script

Run this for each project to auto-generate favicons:

```bash
# Install favicon generator
npm install -g favicon-generator

# Run in each project directory
cd ~/Documents/Development/[project-name]
favicon-generator -i input-image.png -o public/
```

---

## Vercel Dashboard Icon Display

Once you add `favicon.ico` or `icon.png` to your project's `public/` folder:
1. Deploy the project
2. Vercel automatically detects the favicon
3. Icon appears in your project list within 5-10 minutes

---

## Quick Wins (Start with these 5):

1. **wallpeypers** - 🎨 (already has pencil, could upgrade)
2. **tabby** - 🐱 (perfect for tab manager)
3. **wine-de-louton** - 🍷 (obvious choice)
4. **episodic** - 📺 (TV tracker)
5. **plants-de-louton** - 🪴 (plant collection)

---

## Next Steps:

Want me to create a bulk favicon generator script that:
1. Generates all favicons with your chosen emojis
2. Adds them to each project automatically
3. Creates a commit for each project

Let me know which icons you like and I'll automate it!
