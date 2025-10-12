#!/usr/bin/env node
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { basename } from 'path';
import 'dotenv/config';

// Load environment variables from env.shared
const envPath = '/Users/peyton/Documents/Development/env.shared';
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function migrateFile(url, prefix) {
  try {
    console.log(`⬇️  Downloading: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = basename(new URL(url).pathname);
    const key = `${prefix}/${filename}`;

    console.log(`⬆️  Uploading to R2: ${key}`);
    await s3Client.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: response.headers.get('content-type') || 'application/octet-stream',
    }));

    const publicUrl = `${env.R2_PUBLIC_BASE}/${key}`;
    console.log(`✅ Migrated: ${filename} -> ${publicUrl}`);

    return { success: true, url, publicUrl, filename };
  } catch (error) {
    console.error(`❌ Failed to migrate ${url}:`, error.message);
    return { success: false, url, error: error.message };
  }
}

async function main() {
  const [,, urlsFile, prefix] = process.argv;

  if (!urlsFile || !prefix) {
    console.error('Usage: node migrate-files.js <urls-file> <r2-prefix>');
    console.error('Example: node migrate-files.js legacy-urls.txt wallpeypers');
    process.exit(1);
  }

  console.log(`\n🚀 Starting migration...`);
  console.log(`📁 URLs file: ${urlsFile}`);
  console.log(`📦 R2 prefix: ${prefix}`);
  console.log(`🪣 R2 bucket: ${env.R2_BUCKET}`);
  console.log(`\n`);

  const urls = readFileSync(urlsFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  console.log(`📊 Found ${urls.length} URLs to migrate\n`);

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < urls.length; i++) {
    console.log(`\n[${i + 1}/${urls.length}]`);
    const result = await migrateFile(urls[i], prefix);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n📈 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${urls.length}`);

  if (failureCount > 0) {
    console.log(`\n❌ Failed URLs:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log(`\n🎉 Migration complete!`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
