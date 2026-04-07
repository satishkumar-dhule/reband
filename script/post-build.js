#!/usr/bin/env node
/**
 * Post-build script to ensure all static data files, CF Pages routing
 * config files are copied to dist, and the CF Pages _worker.js is compiled.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(rootDir, 'client/public/data');
const DEST_DIR = path.join(rootDir, 'dist/public/data');
const PUBLIC_SRC = path.join(rootDir, 'client/public');
const PUBLIC_DEST = path.join(rootDir, 'dist/public');

console.log('📦 Post-build: Copying static data files...');

fs.mkdirSync(DEST_DIR, { recursive: true });

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (fs.existsSync(SOURCE_DIR)) {
    copyRecursive(SOURCE_DIR, DEST_DIR);
    const files = fs.readdirSync(DEST_DIR);
    console.log(`   ✓ Copied ${files.length} data files to dist/public/data/`);
  } else {
    console.warn('   ⚠️ Source data directory not found. Run data generation scripts first.');
  }
} catch (error) {
  console.error('   ❌ Error copying data files:', error.message);
  process.exit(1);
}

const CF_FILES = ['_redirects', '_routes.json', '_headers'];
for (const file of CF_FILES) {
  const src = path.join(PUBLIC_SRC, file);
  const dest = path.join(PUBLIC_DEST, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`   ✓ Copied ${file} to dist/public/`);
  }
}

console.log('⚙️  Building CF Pages worker (_worker.js)...');
try {
  execSync('node script/build-cf-worker.js', {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch (err) {
  console.error('   ❌ CF Pages worker build failed:', err.message);
  console.warn('   ⚠️ Continuing without _worker.js — API routes may not work on CF Pages');
}

console.log('✅ Post-build complete!');
