#!/usr/bin/env node
import fs from "fs";
import fetch from "node-fetch";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { lookup } from "mime-types";

// Load environment from .env.vercel.production
const envPath = ".env.vercel.production";
const envContent = fs.readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

const wallpapersPath = "data/wallpapers.json";
const legacyUrlsPath = "legacy-urls.txt";
const R2_BASE = env.NEXT_PUBLIC_R2_PUBLIC_BASE;

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function r2Head(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch (error) {
    return false;
  }
}

async function uploadToR2(buffer, key, contentType) {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    return false;
  }
}

async function backfillFromLegacy(filename, legacyUrl) {
  if (!legacyUrl) return false;

  try {
    console.log(`  📥 Fetching from legacy: ${legacyUrl.substring(0, 70)}...`);
    const resp = await fetch(legacyUrl);
    if (!resp.ok) {
      console.log(`  ❌ Legacy fetch failed: ${resp.status}`);
      return false;
    }

    const buffer = Buffer.from(await resp.arrayBuffer());
    const ct = resp.headers.get("content-type") || lookup(filename) || "image/jpeg";
    const key = `wallpeypers/${filename}`;

    console.log(`  ⬆️  Uploading to R2: ${key} (${(buffer.length / 1024).toFixed(1)}KB)`);
    const uploaded = await uploadToR2(buffer, key, ct);

    if (uploaded) {
      console.log(`  ✅ Successfully backfilled: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`  ❌ Error backfilling ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log(`\n🏥 Starting wallpaper healing process...`);
  console.log(`📁 Wallpapers: ${wallpapersPath}`);
  console.log(`📋 Legacy URLs: ${legacyUrlsPath}`);
  console.log(`🪣 R2 bucket: ${env.R2_BUCKET}`);
  console.log(`🔗 R2 base: ${R2_BASE}\n`);

  // Load wallpapers
  const raw = fs.readFileSync(wallpapersPath, "utf8");
  const data = JSON.parse(raw);

  // Load legacy URLs and create filename mapping
  const legacyUrls = fs
    .readFileSync(legacyUrlsPath, "utf8")
    .split("\n")
    .filter((line) => line.trim());

  const legacyMap = new Map();
  legacyUrls.forEach((url) => {
    // Extract filename from URL (last part before query params)
    const fullFilename = url.split("/").pop().split("?")[0];

    // Store both exact filename and base filename (without hash suffix)
    legacyMap.set(fullFilename, url);

    // For files with hash suffix like "filename-HASH.ext", also map "filename.ext"
    const match = fullFilename.match(/^(.+?)-([A-Za-z0-9]{30,})(\.[^.]+)$/);
    if (match) {
      const baseFilename = match[1] + match[3];
      legacyMap.set(baseFilename, url);
    }
  });

  console.log(`📊 Total wallpapers: ${data.length}`);
  console.log(`📊 Legacy URLs mapped: ${legacyMap.size}\n`);

  const missing = [];
  let checkedCount = 0;
  let healedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const filename = item.filename;

    process.stdout.write(`\r[${i + 1}/${data.length}] Checking: ${filename.padEnd(50, ' ')}`);

    // Check if R2 URL exists
    const r2Url = item.url.startsWith("http") ? item.url : `${R2_BASE}/${filename}`;
    const ok = await r2Head(r2Url);
    checkedCount++;

    if (!ok) {
      console.log(`\n\n🔍 Missing: ${filename}`);

      // Try to find legacy URL
      const legacyUrl = legacyMap.get(filename);

      if (legacyUrl) {
        const healed = await backfillFromLegacy(filename, legacyUrl);
        if (healed) {
          item.url = `${R2_BASE}/wallpeypers/${filename}`;
          healedCount++;
        } else {
          missing.push({ filename, legacyUrl, reason: "backfill_failed" });
        }
      } else {
        console.log(`  ⚠️  No legacy URL found for: ${filename}`);
        missing.push({ filename, reason: "no_legacy_url" });
      }
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n\n📈 Healing Summary:`);
  console.log(`✅ Checked: ${checkedCount}`);
  console.log(`🏥 Healed: ${healedCount}`);
  console.log(`❌ Still missing: ${missing.length}`);

  // Save updated wallpapers.json
  fs.writeFileSync(wallpapersPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Updated: ${wallpapersPath}`);

  if (missing.length > 0) {
    const missingPath = "missing-wallpapers.json";
    fs.writeFileSync(missingPath, JSON.stringify(missing, null, 2));
    console.log(`⚠️  Missing files logged to: ${missingPath}`);
    console.log(`\n📋 Missing files:`);
    missing.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.filename} (${m.reason})`);
    });
  } else {
    console.log(`\n🎉 All wallpapers present in R2!`);
  }
}

main().catch((e) => {
  console.error("\n💥 Fatal error:", e);
  process.exit(1);
});
