#!/usr/bin/env node
/**
 * Post-build script to ensure all static data files are copied to dist
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(rootDir, 'client/public/data');
const DEST_DIR = path.join(rootDir, 'dist/public/data');

console.log('📦 Post-build: Copying static data files...');

// Ensure destination directory exists
fs.mkdirSync(DEST_DIR, { recursive: true });

// Copy all files from source to destination
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
    
    // Count files
    const files = fs.readdirSync(DEST_DIR);
    console.log(`   ✓ Copied ${files.length} data files to dist/public/data/`);
  } else {
    console.warn('   ⚠️ Source data directory not found. Run data generation scripts first.');
  }
} catch (error) {
  console.error('   ❌ Error copying data files:', error.message);
  process.exit(1);
}

console.log('✅ Post-build complete!');
