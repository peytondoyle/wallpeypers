import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mime from 'mime-types';
import { exiftool } from 'exiftool-vendored';
import OpenAI from 'openai';
import { put } from '@vercel/blob';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const inputDir = path.join(__dirname, '../public/wallpapers/input');
const thumbDir = path.join(__dirname, '../public/wallpapers/thumbs');
const wallpapersJsonPath = path.join(__dirname, '../data/wallpapers.json');

// Helpers
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const toKebabCase = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const simplifyStyle = (desc) => {
  const styleMap = {
    kawaii: 'Kawaii', cute: 'Kawaii',
    clay: 'Claymation & 3D', claymation: 'Claymation & 3D', plasticine: 'Claymation & 3D', '3d': 'Claymation & 3D',
    cartoon: 'Cartoonish', animated: 'Cartoonish', comic: 'Cartoonish',
    pixel: 'Pixel Art & Retro', retro: 'Pixel Art & Retro', '8-bit': 'Pixel Art & Retro',
    minimalist: 'Minimalist', simple: 'Minimalist', clean: 'Minimalist',
    realistic: 'Photorealistic', photo: 'Photorealistic', photograph: 'Photorealistic',
    abstract: 'Abstract & Graphic', gradient: 'Abstract & Graphic', pattern: 'Abstract & Graphic',
    illustration: 'Illustration', illustrated: 'Illustration', painterly: 'Illustration',
  };
  const text = desc.toLowerCase();
  for (const keyword in styleMap) if (text.includes(keyword)) return styleMap[keyword];
  return 'Illustration';
};

const getImageCreatedDate = async (filePath) => {
  try {
    const tags = await exiftool.read(filePath);
    return tags.CreateDate || tags.DateTimeOriginal || fs.statSync(filePath).birthtime;
  } catch {
    return fs.statSync(filePath).birthtime;
  }
};

const getImageDescription = async (buffer, filename) => {
  const base64Image = buffer.toString('base64');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `
              Describe this image in 5 words or less.

              Then, **confidently** assign one season based only on visual cues (environment, lighting, weather, color palette, etc.). Choose ONLY from: **Spring, Summer, Fall, or Winter**. Do **not** use "Any" or "Unknown". If unsure, still pick the best fit — **never skip**.

              Next, suggest the most fitting style from one of:
              Illustration, Kawaii, Claymation & 3D, Cartoonish, Pixel Art & Retro, Minimalist, Photorealistic, Abstract & Graphic.

              Finally, list 5–10 lowercase, comma-separated descriptive tags (subjects, colors, mood, setting, etc.).

              Your response should be exactly 4 lines:
              Line 1: Short description  
              Line 2: Season  
              Line 3: Style  
              Line 4: tag1, tag2, tag3, ...
              `,
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    max_tokens: 250,
  });

  const text = response.choices[0].message.content;
  console.log(`🧠 GPT Output for ${filename}:\n${text}\n---`);

  const lines = text.split('\n').map(l => l.trim());

  return {
    name: toKebabCase(lines[0]),
    season: capitalize(lines[1]?.match(/spring|summer|fall|autumn|winter/i)?.[0] || 'Any'),
    style: simplifyStyle(lines[2] || 'Illustration'),
    tags: (
      lines.find(l => l.includes(',') && !l.toLowerCase().includes('style')) || ''
    ).split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
  };
};

const getUniqueFilename = (baseName, ext, existingFiles) => {
  let name = `${baseName}.${ext}`;
  let counter = 1;
  while (existingFiles.includes(name)) {
    name = `${baseName}-${counter}.${ext}`;
    counter++;
  }
  return name;
};

// 🧠 MAIN LOGIC
const run = async () => {
  ensureDir(thumbDir);

  const existingWallpapers = fs.existsSync(wallpapersJsonPath)
    ? JSON.parse(fs.readFileSync(wallpapersJsonPath, 'utf8'))
    : [];

  const processedFilenames = existingWallpapers.map(w => w.filename);
  const inputFiles = fs.readdirSync(inputDir).filter(file => {
    const fullPath = path.join(inputDir, file);
    const ext = path.extname(file).toLowerCase();
    return (
      fs.statSync(fullPath).isFile() &&
      ['.jpg', '.jpeg', '.png'].includes(ext)
    );
  });

  for (const file of inputFiles) {
    const inputPath = path.join(inputDir, file);
    const buffer = fs.readFileSync(inputPath);
    const ext = mime.extension(mime.lookup(inputPath) || '') || 'jpg';

    const sourceLabel = file.toLowerCase().startsWith('peyyyyyy') ? 'Peyton' : 'Other';
    const created = await getImageCreatedDate(inputPath);
    const { name, season, style, tags } = await getImageDescription(buffer, file);
    const filename = getUniqueFilename(name, ext, processedFilenames);

    // Upload to Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: true, // Guarantees no overwrite
    });

    // Update JSON
    existingWallpapers.push({
      filename,
      season,
      style,
      source: sourceLabel,
      created: new Date(created).toISOString(),
      url: blob.url,
      tags,
    });

    // Generate thumbnail
    const thumbPath = path.join(thumbDir, filename);
    await sharp(buffer).resize(540, 960, { fit: 'cover' }).toFile(thumbPath);

    // Cleanup
    fs.unlinkSync(inputPath);
    console.log(`✅ Processed: ${filename} [${season || 'Unknown'}, ${style || 'Illustration'}] → tags: ${tags.join(', ')}`);
  }

  fs.writeFileSync(wallpapersJsonPath, JSON.stringify(existingWallpapers, null, 2));
  console.log(`\n🧠 Done! All files processed and uploaded.`);
};

run().catch(console.error);