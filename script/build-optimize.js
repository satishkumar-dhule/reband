#!/usr/bin/env node
/**
 * Build Optimizer: Post-build asset optimization for GitHub Pages
 *
 * Runs AFTER vite build to:
 * 1. Compress JSON data files with gzip + brotli
 * 2. Generate cache-control manifest for GitHub Pages headers
 * 3. Optimize asset file sizes and report savings
 * 4. Create _headers file for CDN cache configuration
 */

import fs from 'fs';
import path from 'path';
import { createGzip, createBrotliCompress } from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist/public');
const dataDir = path.join(distDir, 'data');

// Track optimization stats
const stats = {
  originalSize: 0,
  compressedSize: 0,
  brotliSize: 0,
  filesProcessed: 0,
  filesCompressed: 0,
};

/**
 * Compress a file with gzip and brotli
 * Returns the compressed sizes
 */
async function compressFile(filePath) {
  const content = fs.readFileSync(filePath);
  const originalSize = content.length;

  // Gzip compression
  const gzPath = `${filePath}.gz`;
  const gzBuffer = await new Promise((resolve, reject) => {
    createGzip({ level: 9 }).end(content, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  fs.writeFileSync(gzPath, gzBuffer);

  // Brotli compression (better ratio, supported by all modern browsers)
  const brPath = `${filePath}.br`;
  const brBuffer = await new Promise((resolve, reject) => {
    createBrotliCompress({
      params: {
        0: 11, // BROTLI_PARAM_QUALITY = max
      },
    }).end(content, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  fs.writeFileSync(brPath, brBuffer);

  return {
    original: originalSize,
    gzip: gzBuffer.length,
    brotli: brBuffer.length,
  };
}

/**
 * Minify JSON by removing whitespace (already done at source, but ensure it)
 */
function minifyJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const parsed = JSON.parse(content);
    const minified = JSON.stringify(parsed);
    if (minified.length < content.length) {
      fs.writeFileSync(filePath, minified);
      return content.length - minified.length;
    }
  } catch {
    // Not valid JSON, skip
  }
  return 0;
}

/**
 * Generate _headers file for GitHub Pages cache control
 * GitHub Pages doesn't support custom headers natively, but this file
 * documents the intended caching strategy and can be used with
 * Cloudflare or other CDNs in front of GitHub Pages.
 */
function generateHeadersFile() {
  const headersContent = `# Cache-Control headers for DevPrep static assets
# Applied via CDN (Cloudflare) or GitHub Pages custom headers

# Data JSON files - cache for 1 hour, must revalidate after build
/data/*  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
/data/channels.json  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
/data/questions-index.json  Cache-Control: public, max-age=3600, stale-while-revalidate=86400

# Pagefind search index - cache for 1 day (changes infrequently)
/pagefind/*  Cache-Control: public, max-age=86400, immutable

# Versioned JS/CSS assets - cache forever (hash in filename = cache bust)
/assets/*  Cache-Control: public, max-age=31536000, immutable

# HTML files - short cache, always revalidate
/*.html  Cache-Control: public, max-age=0, must-revalidate
/  Cache-Control: public, max-age=0, must-revalidate

# Images - long cache with revalidation
/*.png  Cache-Control: public, max-age=2592000, stale-while-revalidate=604800
/*.jpg  Cache-Control: public, max-age=2592000, stale-while-revalidate=604800
/*.svg  Cache-Control: public, max-age=2592000, stale-while-revalidate=604800
/*.webp  Cache-Control: public, max-age=2592000, stale-while-revalidate=604800
/*.ico  Cache-Control: public, max-age=2592000, immutable
/*.png  Cache-Control: public, max-age=2592000, immutable

# Fonts - long cache with immutable
/assets/fonts/*  Cache-Control: public, max-age=31536000, immutable

# Service worker - no cache (must always be fresh)
/sw.js  Cache-Control: public, max-age=0, must-revalidate
/manifest.json  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
`;

  fs.writeFileSync(path.join(distDir, '_headers'), headersContent);
  console.log('   ✓ Generated _headers file for CDN cache configuration');
}

/**
 * Generate a cache manifest mapping original files to their compressed variants
 * This helps the frontend choose the best compression format at runtime
 */
function generateCacheManifest() {
  const manifest = {
    version: Date.now(),
    generatedAt: new Date().toISOString(),
    files: {},
  };

  // Scan all files in dist
  function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath, `${prefix}${entry.name}/`);
      } else if (!entry.name.endsWith('.gz') && !entry.name.endsWith('.br')) {
        const key = `${prefix}${entry.name}`;
        const stat = fs.statSync(fullPath);
        manifest.files[key] = {
          size: stat.size,
          hasGz: fs.existsSync(`${fullPath}.gz`),
          hasBr: fs.existsSync(`${fullPath}.br`),
        };
      }
    }
  }

  scanDir(distDir);

  const manifestPath = path.join(distDir, 'cache-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  console.log(`   ✓ Generated cache manifest (${Object.keys(manifest.files).length} files)`);
}

/**
 * Optimize all JSON data files
 */
async function optimizeDataFiles() {
  if (!fs.existsSync(dataDir)) {
    console.log('   ⚠️  No data directory found, skipping data optimization');
    return;
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  console.log(`\n📦 Optimizing ${files.length} data files...`);

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const stat = fs.statSync(filePath);

    // Minify if not already
    const saved = minifyJson(filePath);
    if (saved > 0) {
      console.log(`   ✓ Minified ${file} (saved ${saved} bytes)`);
    }

    // Compress
    try {
      const sizes = await compressFile(filePath);
      stats.originalSize += sizes.original;
      stats.compressedSize += sizes.gzip;
      stats.brotliSize += sizes.brotli;
      stats.filesProcessed++;
      stats.filesCompressed++;

      const gzipRatio = ((1 - sizes.gzip / sizes.original) * 100).toFixed(1);
      const brRatio = ((1 - sizes.brotli / sizes.original) * 100).toFixed(1);
      console.log(`   ✓ ${file}: ${formatBytes(sizes.original)} → gz:${formatBytes(sizes.gzip)} (${gzipRatio}%) br:${formatBytes(sizes.brotli)} (${brRatio}%)`);
    } catch (err) {
      console.error(`   ✗ Failed to compress ${file}: ${err.message}`);
    }
  }
}

/**
 * Optimize Pagefind index files
 */
async function optimizePagefindIndex() {
  const pagefindDir = path.join(distDir, 'pagefind');
  if (!fs.existsSync(pagefindDir)) {
    console.log('   ⚠️  No pagefind directory found, skipping');
    return;
  }

  const files = fs.readdirSync(pagefindDir);
  console.log(`\n🔍 Optimizing ${files.length} Pagefind files...`);

  for (const file of files) {
    const filePath = path.join(pagefindDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      try {
        const sizes = await compressFile(filePath);
        stats.originalSize += sizes.original;
        stats.compressedSize += sizes.gzip;
        stats.brotliSize += sizes.brotli;
        stats.filesProcessed++;
        stats.filesCompressed++;

        const gzipRatio = ((1 - sizes.gzip / sizes.original) * 100).toFixed(1);
        console.log(`   ✓ ${file}: ${formatBytes(sizes.original)} → gz:${formatBytes(sizes.gzip)} (${gzipRatio}%)`);
      } catch (err) {
        console.error(`   ✗ Failed to compress ${file}: ${err.message}`);
      }
    }
  }
}

/**
 * Clean up temporary build artifacts
 */
function cleanupTempFiles() {
  const pagefindSource = path.join(distDir, '_pagefind-source');
  if (fs.existsSync(pagefindSource)) {
    fs.rmSync(pagefindSource, { recursive: true, force: true });
    console.log('   ✓ Cleaned up temporary Pagefind source files');
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Print optimization summary
 */
function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BUILD OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Files processed:    ${stats.filesProcessed}`);
  console.log(`   Files compressed:   ${stats.filesCompressed}`);
  console.log(`   Original size:      ${formatBytes(stats.originalSize)}`);
  console.log(`   Gzip size:          ${formatBytes(stats.compressedSize)}`);
  console.log(`   Brotli size:        ${formatBytes(stats.brotliSize)}`);
  if (stats.originalSize > 0) {
    console.log(`   Gzip savings:       ${((1 - stats.compressedSize / stats.originalSize) * 100).toFixed(1)}%`);
    console.log(`   Brotli savings:     ${((1 - stats.brotliSize / stats.originalSize) * 100).toFixed(1)}%`);
  }
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Build Optimizer: Post-build asset optimization\n');

  // Step 1: Optimize data JSON files
  await optimizeDataFiles();

  // Step 2: Optimize Pagefind index
  await optimizePagefindIndex();

  // Step 3: Generate cache headers file
  generateHeadersFile();

  // Step 4: Generate cache manifest
  generateCacheManifest();

  // Step 5: Clean up temp files
  cleanupTempFiles();

  // Step 6: Print summary
  printSummary();

  console.log('\n✅ Build optimization complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
