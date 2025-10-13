#!/usr/bin/env node
import fs from "fs";

const wallpapersPath = "data/wallpapers.json";
const missingPath = "missing-wallpapers.json";

console.log(`\n🗑️  Removing unrecoverable wallpapers...\n`);

// Load wallpapers and missing list
const wallpapers = JSON.parse(fs.readFileSync(wallpapersPath, "utf8"));
const missing = JSON.parse(fs.readFileSync(missingPath, "utf8"));

const missingFilenames = new Set(missing.map((m) => m.filename));
const before = wallpapers.length;

// Filter out missing wallpapers
const filtered = wallpapers.filter((w) => !missingFilenames.has(w.filename));
const after = filtered.length;
const removed = before - after;

console.log(`📊 Before: ${before} wallpapers`);
console.log(`📊 After: ${after} wallpapers`);
console.log(`🗑️  Removed: ${removed} wallpapers\n`);

// Save updated JSON
fs.writeFileSync(wallpapersPath, JSON.stringify(filtered, null, 2));
console.log(`✅ Updated: ${wallpapersPath}`);

// Archive missing list
const archivePath = `backups/missing-wallpapers-${new Date().toISOString().split('T')[0]}.json`;
fs.mkdirSync("backups", { recursive: true });
fs.writeFileSync(archivePath, JSON.stringify(missing, null, 2));
console.log(`📦 Archived missing list to: ${archivePath}\n`);

console.log(`✅ Done! ${after} wallpapers remaining.`);
