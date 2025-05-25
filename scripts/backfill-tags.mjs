import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __dirname = path.resolve();
const jsonPath = path.join(__dirname, 'data/wallpapers.json');
const thumbsDir = path.join(__dirname, 'public/wallpapers/thumbs');

const getTagsFromThumbnail = async (filename, buffer) => {
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
Describe this image in 5 words or less. Then, based strictly on visual cues (e.g., environment, lighting, weather, foliage, color palette, activities), assign one season: Spring, Summer, Fall, or Winter. Do NOT use "Any" — choose the best seasonal fit, even if it's not obvious. Then, suggest the best style category (choose one from: Illustration, Kawaii, Claymation & 3D, Cartoonish, Pixel Art & Retro, Minimalist, Photorealistic, Abstract & Graphic). Then, list 5–10 descriptive tags in lowercase, comma-separated format (themes, objects, colors, mood, subjects, etc.).

Output format:
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
  const tagLine =
    lines.find(l => l.includes(',') && !l.toLowerCase().includes('style')) || '';

  return tagLine.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
};

const run = async () => {
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updatedCount = 0;

  for (const entry of json) {
    if (entry.tags && entry.tags.length > 0) continue;

    const thumbPath = path.join(thumbsDir, entry.filename);
    if (!fs.existsSync(thumbPath)) {
      console.warn(`⚠️ Thumbnail not found for: ${entry.filename}`);
      continue;
    }

    const buffer = fs.readFileSync(thumbPath);
    const tags = await getTagsFromThumbnail(entry.filename, buffer);
    if (tags.length) {
      entry.tags = tags;
      updatedCount++;
      console.log(`✅ Tagged ${entry.filename} → ${tags.join(', ')}`);
    } else {
      console.warn(`⚠️ No tags generated for ${entry.filename}`);
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
  console.log(`\n🎯 Backfill complete. Updated ${updatedCount} entries with tags.`);
};

run().catch(console.error);