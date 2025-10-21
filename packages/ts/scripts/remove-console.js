#!/usr/bin/env node

/**
 * Remove all console.* calls from built JavaScript files
 *
 * Uses esbuild to transform all .js files in dist/ and dist-esm/
 * with the drop: ['console'] option to remove console statements.
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

/**
 * Recursively find all .js files in a directory
 */
function findJsFiles(dir) {
    const results = [];

    if (!fs.existsSync(dir)) {
        return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            results.push(...findJsFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Process a JS file to remove console statements
 */
async function processFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');

    try {
        const result = await esbuild.transform(code, {
            loader: 'js',
            drop: ['console'],
            // Preserve original formatting as much as possible
            minify: false,
            // Keep the target the same as TypeScript output
            target: 'es2017',
        });

        fs.writeFileSync(filePath, result.code, 'utf8');
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        throw error;
    }
}

/**
 * Main execution
 */
async function main() {
    const distDir = path.join(__dirname, '../dist');
    const distEsmDir = path.join(__dirname, '../dist-esm');

    // Find all JS files in both directories
    const distFiles = findJsFiles(distDir);
    const distEsmFiles = findJsFiles(distEsmDir);
    const allFiles = [...distFiles, ...distEsmFiles];

    if (allFiles.length === 0) {
        console.log('⚠ No JavaScript files found to process');
        return;
    }

    console.log(`🔧 Removing console statements from ${allFiles.length} files...`);

    // Process all files
    await Promise.all(allFiles.map(processFile));

    console.log('✓ Console statements removed successfully');
}

main().catch(error => {
    console.error('Failed to remove console statements:', error);
    process.exit(1);
});
