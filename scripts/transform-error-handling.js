#!/usr/bin/env node

/**
 * Transform generated OpenAPI code to only throw on 5xx errors.
 * For 3xx/4xx errors, return the error response with success: false instead of throwing.
 *
 * This script modifies all *ApiResponseProcessor methods in the generated code.
 */

const fs = require('fs');
const path = require('path');

const GENERATED_APIS_DIR = path.join(__dirname, '../packages/ts/generated/apis');

/**
 * Transform a single API file's error handling logic
 */
function transformFile(filePath) {
    console.log(`Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern to match the ResponseProcessor methods
    // We need to transform blocks that look like:
    //   if (isCodeInRange("XXX", response.httpStatusCode)) {
    //       const body: SomeType = ObjectSerializer.deserialize(...);
    //       throw new ApiException<SomeType>(response.httpStatusCode, "Message", body, response.headers);
    //   }

    // Match throw statements for status codes 300-499
    const throwPattern = /if \(isCodeInRange\("([3-4]\d{2})",\s*response\.httpStatusCode\)\)\s*\{([^}]*?)throw new ApiException<([^>]+)>\(response\.httpStatusCode,\s*"([^"]+)",\s*body,\s*response\.headers\);/gs;

    content = content.replace(throwPattern, (match, statusCode, bodyBlock, typeParam, message) => {
        modified = true;
        console.log(`  → Transforming ${statusCode} error to return instead of throw`);

        // Return the error body with success: false flag, using 200 status to prevent throwing
        return `if (isCodeInRange("${statusCode}", response.httpStatusCode)) {${bodyBlock}return new HttpInfo(200, response.headers, response.body, { ...body, success: false, _originalStatusCode: response.httpStatusCode } as any);`;
    });

    // Also handle the catch-all "Unknown API Status Code" throw at the end of each method
    // We want to keep this as a throw only for 5xx errors
    const unknownErrorPattern = /throw new ApiException<string \| Blob \| undefined>\(response\.httpStatusCode,\s*"Unknown API Status Code!",\s*await response\.getBodyAsAny\(\),\s*response\.headers\);/g;

    content = content.replace(unknownErrorPattern, (match) => {
        modified = true;
        console.log(`  → Wrapping unknown error handling to check status code`);

        return `// Only throw for 5xx errors, otherwise return error response
        if (response.httpStatusCode >= 500) {
            throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Server Error", await response.getBodyAsAny(), response.headers);
        } else {
            // For 3xx/4xx errors not explicitly handled, return as error response
            return new HttpInfo(200, response.headers, response.body, {
                error: "Client Error",
                success: false,
                _originalStatusCode: response.httpStatusCode,
                _body: await response.getBodyAsAny()
            } as any);
        }`;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Modified ${filePath}`);
    } else {
        console.log(`  - No changes needed for ${filePath}`);
    }

    return modified;
}

/**
 * Process all API files in the generated directory
 */
function processAllFiles() {
    console.log('\n🔧 Transforming error handling in generated API files...\n');

    if (!fs.existsSync(GENERATED_APIS_DIR)) {
        console.error(`Error: Generated APIs directory not found at ${GENERATED_APIS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(GENERATED_APIS_DIR)
        .filter(file => file.endsWith('Api.ts') && file !== 'baseapi.ts');

    let totalModified = 0;

    files.forEach(file => {
        const filePath = path.join(GENERATED_APIS_DIR, file);
        if (transformFile(filePath)) {
            totalModified++;
        }
    });

    console.log(`\n✅ Transformation complete! Modified ${totalModified}/${files.length} files.\n`);
}

// Run the transformation
processAllFiles();
