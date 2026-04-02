#!/usr/bin/env node
/**
 * Build Pagefind search index from generated HTML files
 *
 * Optimizations:
 * - Uses local pagefind binary instead of npx (faster, no download)
 * - Cleans up temporary source HTML after indexing
 * - Reports index size for monitoring
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourceDir = path.join(rootDir, 'dist/public/_pagefind-source');
const outputDir = path.join(rootDir, 'dist/public');

// Check if source directory exists
if (!fs.existsSync(sourceDir)) {
  console.log('⚠️  Pagefind source directory not found. Run generate-pagefind-index.js first.');
  process.exit(0);
}

// Count source files
const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.html'));
console.log(`🔍 Building Pagefind search index from ${sourceFiles.length} HTML files...`);

const startTime = Date.now();

try {
  // Use local pagefind binary (already in node_modules) instead of npx
  const pagefindBin = path.join(rootDir, 'node_modules', '.bin', 'pagefind');
  const pagefindOutput = path.join(outputDir, 'pagefind');

  execSync(`"${pagefindBin}" --site "${sourceDir}" --output-path "${pagefindOutput}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Pagefind index built successfully in ${elapsed}s!`);

  // Report index size
  if (fs.existsSync(pagefindOutput)) {
    const indexFiles = fs.readdirSync(pagefindOutput);
    let totalSize = 0;
    for (const file of indexFiles) {
      const stat = fs.statSync(path.join(pagefindOutput, file));
      totalSize += stat.size;
    }
    const sizeKB = (totalSize / 1024).toFixed(1);
    console.log(`📁 Index: ${indexFiles.length} files, ${sizeKB} KB`);
  }

  // Clean up temporary source HTML to reduce dist size
  fs.rmSync(sourceDir, { recursive: true, force: true });
  console.log('🧹 Cleaned up temporary Pagefind source files');

} catch (error) {
  console.error('❌ Failed to build Pagefind index:', error.message);
  process.exit(1);
}
