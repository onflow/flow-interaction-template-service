"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsDebugLogger = exports.createCorsMiddleware = exports.securityHeaders = exports.createCorsOptions = void 0;
const cors_1 = __importDefault(require("cors"));
/**
 * Creates CORS options based on environment configuration
 *
 * @param allowedOrigins - Comma-separated string of allowed origins or "*" for all
 * @param allowCredentials - Whether to allow credentials in requests
 * @returns CORS options object
 */
const createCorsOptions = (allowedOrigins, allowCredentials) => {
    // Parse allowed origins
    let origin = allowedOrigins;
    if (allowedOrigins !== "*") {
        // Split comma-separated origins and trim whitespace
        origin = allowedOrigins.split(",").map(o => o.trim()).filter(o => o.length > 0);
        // If no valid origins, default to false (no origins allowed)
        if (origin.length === 0) {
            origin = false;
        }
    }
    return {
        origin,
        credentials: allowCredentials,
        optionsSuccessStatus: 200,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Origin",
            "X-Requested-With",
            "Content-Type",
            "Accept",
            "Authorization",
            "Cache-Control",
            "X-Flow-Network", // Flow-specific header
            "X-Request-ID" // Request tracking
        ],
        exposedHeaders: [
            "Content-Range",
            "X-Content-Range",
            "X-Rate-Limit-Remaining",
            "X-Rate-Limit-Reset"
        ],
        maxAge: 86400 // 24 hours preflight cache
    };
};
exports.createCorsOptions = createCorsOptions;
/**
 * Security headers middleware
 * Adds security headers to all responses - configured for public API access
 */
const securityHeaders = (req, res, next) => {
    // Basic security headers (keep minimal for public API)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // More permissive frame options for embedding in web apps
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Remove server information for security
    res.removeHeader('X-Powered-By');
    // Content Security Policy for the HTML welcome page only
    if (req.path === '/' && req.method === 'GET') {
        res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'unsafe-inline'; script-src 'none'; object-src 'none';");
    }
    // Add cache control for API responses
    if (req.path.startsWith('/v1/')) {
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    }
    next();
};
exports.securityHeaders = securityHeaders;
/**
 * Creates CORS middleware with the given configuration
 *
 * @param config - CORS configuration object
 * @returns Express middleware function
 */
const createCorsMiddleware = (config) => {
    const corsOptions = (0, exports.createCorsOptions)(config.allowedOrigins, config.allowCredentials);
    return (0, cors_1.default)(corsOptions);
};
exports.createCorsMiddleware = createCorsMiddleware;
/**
 * Request logging middleware for debugging CORS issues
 */
const corsDebugLogger = (req, res, next) => {
    const origin = req.headers.origin;
    const method = req.method;
    if (method === 'OPTIONS' || origin) {
        console.log(`[CORS] ${method} request from origin: ${origin || 'none'}`);
        console.log(`[CORS] Headers: ${JSON.stringify(req.headers, null, 2)}`);
    }
    next();
};
exports.corsDebugLogger = corsDebugLogger;
