#!/usr/bin/env node
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { lookup } from 'mime-types';

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

async function uploadFile(filePath, filename, prefix) {
  try {
    const buffer = readFileSync(filePath);
    const key = `${prefix}/${filename}`;
    const contentType = lookup(filename) || 'application/octet-stream';

    console.log(`⬆️  Uploading: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);

    await s3Client.send(new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    const publicUrl = `${env.R2_PUBLIC_BASE}/${key}`;
    console.log(`✅ Uploaded: ${publicUrl}`);

    return { success: true, filename, publicUrl };
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error.message);
    return { success: false, filename, error: error.message };
  }
}

async function main() {
  const localDir = 'public/wallpapers/full';
  const prefix = 'wallpeypers';

  console.log(`\n🚀 Starting upload from local files...`);
  console.log(`📁 Local directory: ${localDir}`);
  console.log(`📦 R2 prefix: ${prefix}`);
  console.log(`🪣 R2 bucket: ${env.R2_BUCKET}\n`);

  const files = readdirSync(localDir).filter(f => !f.startsWith('.'));

  console.log(`📊 Found ${files.length} files to upload\n`);

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = join(localDir, filename);

    console.log(`\n[${i + 1}/${files.length}]`);
    const result = await uploadFile(filePath, filename, prefix);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n📈 Upload Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${files.length}`);

  if (failureCount > 0) {
    console.log(`\n❌ Failed files:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.filename}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log(`\n🎉 Upload complete!`);
  console.log(`\n💡 Next: Update data/wallpapers.json to point to R2 URLs`);
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
