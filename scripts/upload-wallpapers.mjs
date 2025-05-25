// upload-wallpapers.mjs
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../public/wallpapers/full');

const files = [
  'beach-cats.png',
  'campfire-by-sunset-beach-summer.png',
  'beach-bonfire-under-starry-sky.png',
  'cactus-blossoms-during-vibrant-sunset.png',
  'cacti-with-vibrant-blooms-sunset.png',
  'frogs-lounging-with-sunglasses.png',
  'frogs-in-sunglasses-relaxing-beach.png',
  'frogs-wearing-sunglasses-hats.png',
  'cute-animals-on-bus-ride.png',
  'cute-animals-in-colorful-van.png',
  'cute-bears-enjoying-beach-picnic.png',
  'cute-animals-on-summer-beach.png',
  'colorful-umbrellas-on-crowded-beach.png',
  'cats-wearing-sunglasses-at-beach.png',
  'hamsters-vacationing-on-beach.png',
  'cute-hamsters-enjoying-beach-vibes.png',
  'hamsters-beach-umbrellas-sand-castles.png',
  'cute-picnic-with-fruits.png',
  'vibrant-whimsical-seaside-amusement-park.png',
  'beachside-caf-miniatures-sunset.png',
  'miniature-tropical-beach-scene.png',
  'miniature-beachside-scene-sunset.png',
  'miniature-beach-scene-sunset.png'
];

const upload = async () => {
  for (const file of files) {
    const fullPath = path.join(uploadDir, file);
    const fileBuffer = await fs.readFile(fullPath);
    const uploaded = await put(file, fileBuffer, { access: 'public' });
    console.log(`✅ Uploaded: ${file}`);
    console.log(`   ${uploaded.url}`);
  }
};

upload().catch((err) => {
  console.error('❌ Upload failed:', err);
});