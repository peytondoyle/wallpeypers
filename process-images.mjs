import fs from 'fs';
import path from 'path';
import { exiftool } from 'exiftool-vendored';
import OpenAI from 'openai';
import mime from 'mime-types';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const inputDir = 'public/wallpapers/input';
const outputDir = 'public/wallpapers/full';
const wallpapersJsonPath = 'data/wallpapers.json';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const toKebabCase = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getUniqueFilename = (baseName, ext) => {
  let name = `${baseName}.${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(outputDir, name))) {
    name = `${baseName}-${counter}.${ext}`;
    counter++;
  }
  return name;
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

const getImageCreatedDate = async (filePath) => {
  try {
    const tags = await exiftool.read(filePath);
    return tags.CreateDate || tags.DateTimeOriginal || fs.statSync(filePath).birthtime;
  } catch {
    return fs.statSync(filePath).birthtime;
  }
};

const simplifyStyle = (desc) => {
  const styleMap = {
    kawaii: 'Kawaii',
    cute: 'Kawaii',
    clay: 'Claymation & 3D',
    claymation: 'Claymation & 3D',
    plasticine: 'Claymation & 3D',
    '3d': 'Claymation & 3D',
    cartoon: 'Cartoonish',
    animated: 'Cartoonish',
    comic: 'Cartoonish',
    pixel: 'Pixel Art & Retro',
    retro: 'Pixel Art & Retro',
    '8-bit': 'Pixel Art & Retro',
    minimalist: 'Minimalist',
    simple: 'Minimalist',
    clean: 'Minimalist',
    realistic: 'Photorealistic',
    photo: 'Photorealistic',
    photograph: 'Photorealistic',
    abstract: 'Abstract & Graphic',
    gradient: 'Abstract & Graphic',
    pattern: 'Abstract & Graphic',
    illustration: 'Illustration',
    illustrated: 'Illustration',
    painterly: 'Illustration'
  };

  const text = desc.toLowerCase();
  for (const keyword in styleMap) {
    if (text.includes(keyword)) return styleMap[keyword];
  }
  return 'Illustration';
};

const getImageDescription = async (buffer) => {
  const base64Image = buffer.toString('base64');
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Describe this image in 5 words or less, then suggest the best season and style category (choose one from: Illustration, Kawaii, Claymation & 3D, Cartoonish, Pixel Art & Retro, Minimalist, Photorealistic, Abstract & Graphic).',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 150,
  });

  const text = response.choices[0].message.content;
  const [descriptionLine, seasonLine, styleLine] = text.split('\n').map((x) => x.trim());

  return {
    name: toKebabCase(descriptionLine),
    season: capitalize(seasonLine.match(/spring|summer|fall|autumn|winter/i)?.[0] || 'Any'),
    style: simplifyStyle(styleLine),
  };
};

const processImagesInFolder = async (folderPath) => {
  const files = fs.readdirSync(folderPath);
  const wallpapers = fs.existsSync(wallpapersJsonPath)
    ? JSON.parse(fs.readFileSync(wallpapersJsonPath, 'utf8'))
    : [];

  for (const file of files) {
    const inputPath = path.join(folderPath, file);
    const buffer = fs.readFileSync(inputPath);
    const ext = mime.extension(mime.lookup(inputPath) || '') || 'jpg';
    if (!['jpg', 'jpeg', 'png'].includes(ext)) continue;

    const sourceLabel = file.toLowerCase().startsWith('peyyyyyy') ? 'Peyton' : 'Other';
    const created = await getImageCreatedDate(inputPath);

    try {
      const { name, season, style } = await getImageDescription(buffer);
      const uniqueFilename = getUniqueFilename(name, ext);
      const outputPath = path.join(outputDir, uniqueFilename);

      fs.writeFileSync(outputPath, buffer);

      wallpapers.push({
        filename: uniqueFilename,
        season,
        style,
        source: sourceLabel,
        created: new Date(created).toISOString(),
      });

      console.log(`✓ ${file} → ${uniqueFilename} [${season}, ${style}, ${sourceLabel}]`);
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
    }

    fs.unlinkSync(inputPath);
  }

  fs.writeFileSync(wallpapersJsonPath, JSON.stringify(wallpapers, null, 2));
};

const main = async () => {
  ensureDir(outputDir);
  const subfolders = fs.readdirSync(inputDir);
  for (const sub of subfolders) {
    const fullPath = path.join(inputDir, sub);
    if (fs.statSync(fullPath).isDirectory()) {
      await processImagesInFolder(fullPath);
    }
  }
};

main();