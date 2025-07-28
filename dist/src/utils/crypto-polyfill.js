"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polyfillRandomUUID = polyfillRandomUUID;
const crypto_1 = require("crypto");
/**
 * Polyfill for crypto.randomUUID() for environments that don't support it
 * This ensures compatibility with older Node.js versions or browser environments
 */
function polyfillRandomUUID() {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && !globalThis.crypto.randomUUID) {
        globalThis.crypto.randomUUID = function () {
            // Generate 16 random bytes
            const bytes = (0, crypto_1.randomBytes)(16);
            // Set version (4) and variant bits according to RFC 4122
            bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
            bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
            // Convert to UUID string format
            const hex = bytes.toString('hex');
            return [
                hex.substring(0, 8),
                hex.substring(8, 12),
                hex.substring(12, 16),
                hex.substring(16, 20),
                hex.substring(20, 32)
            ].join('-');
        };
    }
    // Also ensure it's available on the global crypto object in Node.js
    if (typeof global !== 'undefined' && global.crypto && !global.crypto.randomUUID) {
        global.crypto.randomUUID = function () {
            const bytes = (0, crypto_1.randomBytes)(16);
            bytes[6] = (bytes[6] & 0x0f) | 0x40;
            bytes[8] = (bytes[8] & 0x3f) | 0x80;
            const hex = bytes.toString('hex');
            return [
                hex.substring(0, 8),
                hex.substring(8, 12),
                hex.substring(12, 16),
                hex.substring(16, 20),
                hex.substring(20, 32)
            ].join('-');
        };
    }
}
// Apply the polyfill immediately when this module is imported
polyfillRandomUUID();
