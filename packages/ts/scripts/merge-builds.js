#!/usr/bin/env node

/**
 * Create proper dual ESM/CJS package structure
 *
 * Strategy: Keep CJS in dist/, create parallel ESM in dist/esm/
 * Update package.json exports to use conditional exports
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const distEsmTempDir = path.join(__dirname, '../dist-esm');
const distEsmDir = path.join(distDir, 'esm');

// Create dist/esm directory
if (!fs.existsSync(distEsmDir)) {
    fs.mkdirSync(distEsmDir, { recursive: true });
}

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy entire dist-esm contents to dist/esm
copyDirectory(distEsmTempDir, distEsmDir);

// Create index.esm.js at root for backwards compatibility
fs.copyFileSync(
    path.join(distEsmDir, 'index.js'),
    path.join(distDir, 'index.esm.js')
);

// Clean up temporary dist-esm directory
fs.rmSync(distEsmTempDir, { recursive: true, force: true });

console.log('✓ ESM and CJS builds merged successfully');
console.log('  - CommonJS: dist/**/*.js');
console.log('  - ESM: dist/esm/**/*.js and dist/index.esm.js');
