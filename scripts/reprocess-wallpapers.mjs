import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import https from 'https';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const fullDir = path.join(__dirname, '../public/wallpapers/full');
const thumbDir = path.join(__dirname, '../public/wallpapers/thumbs');
const backupFullDir = path.join(__dirname, '../public/wallpapers/full-backup');
const backupThumbDir = path.join(__dirname, '../public/wallpapers/thumbs-backup');
const jsonPath = path.join(__dirname, '../data/wallpapers.json');
const backupJsonPath = path.join(__dirname, '../data/wallpapers.backup.json');

const TARGET_FULL_WIDTH = 1170;
const TARGET_FULL_HEIGHT = 2535;
const TARGET_THUMB_WIDTH = 540;
const TARGET_THUMB_HEIGHT = 1170;

const downloadFile = async (url, destPath) => {
  await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url} — Status code: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => fileStream.close(resolve));
      fileStream.on('error', (err) => fs.unlink(destPath, () => reject(err)));
    }).on('error', reject);
  });
};

const run = async () => {
  [fullDir, thumbDir, backupFullDir, backupThumbDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const wallpapers = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const backupWallpapers = JSON.parse(fs.readFileSync(backupJsonPath, 'utf-8'));

  for (const wp of wallpapers) {
    try {
      const fullPath = path.join(fullDir, wp.filename);
      const thumbPath = path.join(thumbDir, wp.filename);
      const backupFullPath = path.join(backupFullDir, wp.filename);
      const backupThumbPath = path.join(backupThumbDir, wp.filename);

      if (!fs.existsSync(fullPath)) {
        console.warn(`⬇️  Downloading missing full: ${wp.filename}`);
        await downloadFile(wp.url, fullPath);
      }

      if (!fs.existsSync(fullPath)) {
        throw new Error(`❌ Still missing after download attempt: ${wp.filename}`);
      }

      // Backup originals
      fs.copyFileSync(fullPath, backupFullPath);
      if (fs.existsSync(thumbPath)) fs.copyFileSync(thumbPath, backupThumbPath);

      const buffer = fs.readFileSync(fullPath);
      const metadata = await sharp(buffer).metadata();

      console.log(`📐 ${wp.filename}: ${metadata.width} x ${metadata.height}`);

      if (metadata.width > metadata.height) {
        throw new Error(`⚠️ Image is landscape`);
      }

      if (metadata.width < TARGET_FULL_WIDTH || metadata.height < TARGET_FULL_HEIGHT) {
      console.warn(`⚠️ Upscaling ${wp.filename} from ${metadata.width}x${metadata.height} to fit full target`);
      }

      // Reprocess full-size
      const fullBuffer = await sharp(buffer)
        .resize(TARGET_FULL_WIDTH, TARGET_FULL_HEIGHT, { fit: 'cover' })
        .toBuffer();

        // Upload full-size to Vercel Blob
        const uploaded = await put(wp.filename, fullBuffer, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        });

        wp.url = uploaded.url;

        // Save resized full image locally too
        fs.writeFileSync(fullPath, fullBuffer);

      // Reprocess thumbnail
      await sharp(buffer)
        .resize(TARGET_THUMB_WIDTH, TARGET_THUMB_HEIGHT, { fit: 'cover' })
        .toFile(thumbPath);

      wp.thumbUrl = `/wallpapers/thumbs/${wp.filename}`;

      // Restore original created date
      const match = backupWallpapers.find((b) => b.filename === wp.filename);
      if (match?.created) {
        wp.created = match.created;
      }

      console.log(`✅ Reprocessed ${wp.filename}`);
    } catch (err) {
      console.error(`❌ Error processing ${wp.filename}: ${err.message}`);
      throw err; // Stop execution immediately
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(wallpapers, null, 2));
  console.log('\n🎉 All wallpapers reprocessed and updated.');
};

run().catch((err) => {
  console.error('\n🚨 Job failed. See error above.');
  process.exit(1);
});