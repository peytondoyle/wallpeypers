#!/usr/bin/env node
/**
 * Bulk Favicon Generator for all Vercel projects
 * Generates emoji-based favicons for each project
 */

import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const projects = [
  { name: 'wallpeypers', emoji: '🎨', color: '#FFB6D9' },
  { name: 'tabby', emoji: '🐱', color: '#FF9500' },
  { name: 'wine-de-louton', emoji: '🍷', color: '#722F37' },
  { name: 'imposter', emoji: '🎭', color: '#C7372F' },
  { name: 'wordle', emoji: '🟩', color: '#6AAA64' },
  { name: 'sundial', emoji: '☀️', color: '#FFD700' },
  { name: 'plants-de-louton', emoji: '🪴', color: '#4A7C59' },
  { name: 'housewives-wiki', emoji: '👑', color: '#FFD700' },
  { name: 'louton-plant-guide', emoji: '🌿', color: '#5F8D4E' },
  { name: 'episodic', emoji: '📺', color: '#5E72E4' },
  { name: 'tori-in-rva', emoji: '📍', color: '#00B4D8' },
  { name: 'blank-slate', emoji: '⬜', color: '#F8F9FA' },
  { name: 'shelf-life', emoji: '📚', color: '#8B4513' },
  { name: 'scan-receipt-edge', emoji: '🧾', color: '#4CAF50' },
  { name: 'peytons-books', emoji: '📕', color: '#D32F2F' },
];

function generateSVGFavicon(emoji, bgColor = '#FFFFFF') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${bgColor}" rx="64"/>
  <text x="256" y="350" font-size="280" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji">${emoji}</text>
</svg>`;
}

async function generateFaviconForProject(project) {
  const projectPath = path.join(process.env.HOME, 'Documents', 'Development', project.name);

  if (!fs.existsSync(projectPath)) {
    console.log(`⚠️  ${project.name}: Project not found at ${projectPath}`);
    return { success: false, reason: 'not_found' };
  }

  const publicPath = path.join(projectPath, 'public');

  // Create public folder if it doesn't exist
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  // Generate SVG icon
  const svgPath = path.join(publicPath, 'icon.svg');
  const svgContent = generateSVGFavicon(project.emoji, project.color);
  fs.writeFileSync(svgPath, svgContent);

  console.log(`✅ ${project.name}: Generated ${project.emoji} favicon`);

  return { success: true, path: svgPath };
}

async function main() {
  console.log('\n🎨 Generating favicons for all projects...\n');

  const results = [];

  for (const project of projects) {
    const result = await generateFaviconForProject(project);
    results.push({ project: project.name, ...result });
  }

  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Generated: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Failed projects:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.project} (${r.reason})`);
    });
  }

  console.log('\n🚀 Next steps:');
  console.log('1. Review the generated favicons in each project\'s public/ folder');
  console.log('2. Commit and deploy each project to see icons in Vercel');
  console.log('3. Icons will appear in Vercel dashboard within 5-10 minutes');
}

main().catch(console.error);
