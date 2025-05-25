import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputDir = path.join(__dirname, '../public/wallpapers/full');
const outputDir = path.join(__dirname, '../public/wallpapers/thumbs');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter((file) =>
  ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase())
);

const generateThumbnail = async (file) => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  await sharp(inputPath)
    .resize(540, 960, { fit: 'cover' })
    .toFile(outputPath);

  console.log(`✓ Thumbnail created: ${file}`);
};

(async () => {
  for (const file of files) {
    try {
      await generateThumbnail(file);
    } catch (err) {
      console.error(`✗ Error creating thumbnail for ${file}:`, err.message);
    }
  }
})();