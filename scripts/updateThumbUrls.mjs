// scripts/updateThumbUrls.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wallpapersPath = path.resolve('data/wallpapers.json');
const backupPath = path.resolve('data/wallpapers.backup.json');
const thumbsDir = path.join(__dirname, '../public/wallpapers/thumbs');

// Backup original
fs.copyFileSync(wallpapersPath, backupPath);
console.log('🛟 Backup created at wallpapers.backup.json');

const raw = fs.readFileSync(wallpapersPath, 'utf-8');
const wallpapers = JSON.parse(raw);

const updated = wallpapers.map((entry) => {
  const thumbPath = path.join(thumbsDir, entry.filename);
  const thumbExists = fs.existsSync(thumbPath);

  return {
    ...entry,
    thumbUrl: thumbExists ? `/wallpapers/thumbs/${entry.filename}` : null,
  };
});

// Optional: Filter out or log missing thumbs
const missingThumbs = updated.filter((w) => !w.thumbUrl);
if (missingThumbs.length) {
  console.warn('⚠️ Missing thumbs for the following files:');
  missingThumbs.forEach((w) => console.warn(` - ${w.filename}`));
}

fs.writeFileSync(wallpapersPath, JSON.stringify(updated, null, 2));
console.log(`✅ Updated ${updated.length} entries with thumbUrl.`);