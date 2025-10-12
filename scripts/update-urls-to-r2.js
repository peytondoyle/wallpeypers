#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

const R2_PUBLIC_BASE = 'https://pub-a0f86dca503044cda0278eb6bafbe7d9.r2.dev';
const R2_PREFIX = 'wallpeypers';

function updateUrls(dryRun = false) {
  const data = JSON.parse(readFileSync('data/wallpapers.json', 'utf-8'));

  let updated = 0;
  let skipped = 0;

  const updatedData = data.map(wallpaper => {
    if (wallpaper.url && !wallpaper.url.includes(R2_PUBLIC_BASE)) {
      const filename = basename(new URL(wallpaper.url).pathname);
      const newUrl = `${R2_PUBLIC_BASE}/${R2_PREFIX}/${filename}`;

      if (dryRun) {
        console.log(`Would update:`);
        console.log(`  Old: ${wallpaper.url}`);
        console.log(`  New: ${newUrl}\n`);
      }

      updated++;
      return { ...wallpaper, url: newUrl };
    }

    skipped++;
    return wallpaper;
  });

  console.log(`\n📊 Summary:`);
  console.log(`  ✏️  URLs to update: ${updated}`);
  console.log(`  ⏭️  URLs already on R2: ${skipped}`);
  console.log(`  📁 Total entries: ${data.length}`);

  if (!dryRun && updated > 0) {
    writeFileSync('data/wallpapers.json', JSON.stringify(updatedData, null, 2));
    console.log(`\n✅ Updated data/wallpapers.json`);
  }

  return { updated, skipped, total: data.length };
}

const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  console.log(`\n🔍 DRY RUN - Showing changes that will be made:\n`);
}

const result = updateUrls(isDryRun);

if (isDryRun && result.updated > 0) {
  console.log(`\n💡 Run without --dry-run to apply changes`);
  console.log(`   node scripts/update-urls-to-r2.js`);
}
