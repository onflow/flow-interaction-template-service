import { Request, Response, NextFunction } from "express";
import cors from "cors";

/**
 * CORS Configuration Interface
 */
export interface CorsConfig {
  allowedOrigins: string;
  allowCredentials: boolean;
}

/**
 * Creates CORS options based on environment configuration
 * 
 * @param allowedOrigins - Comma-separated string of allowed origins or "*" for all
 * @param allowCredentials - Whether to allow credentials in requests
 * @returns CORS options object
 */
export const createCorsOptions = (allowedOrigins: string, allowCredentials: boolean) => {
  // Parse allowed origins
  let origin: string | string[] | boolean = allowedOrigins;
  
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
      "X-Request-ID"    // Request tracking
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

/**
 * Security headers middleware
 * Adds security headers to all responses - configured for public API access
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Basic security headers (keep minimal for public API)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // More permissive frame options for embedding in web apps
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Remove server information for security
  res.removeHeader('X-Powered-By');
  
  // Content Security Policy for the HTML welcome page only
  if (req.path === '/' && req.method === 'GET') {
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; style-src 'unsafe-inline'; script-src 'none'; object-src 'none';"
    );
  }
  
  // Add cache control for API responses
  if (req.path.startsWith('/v1/')) {
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  }
  
  next();
};

/**
 * Creates CORS middleware with the given configuration
 * 
 * @param config - CORS configuration object
 * @returns Express middleware function
 */
export const createCorsMiddleware = (config: CorsConfig) => {
  const corsOptions = createCorsOptions(config.allowedOrigins, config.allowCredentials);
  return cors(corsOptions);
};

/**
 * Request logging middleware for debugging CORS issues
 */
export const corsDebugLogger = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const method = req.method;
  
  if (method === 'OPTIONS' || origin) {
    console.log(`[CORS] ${method} request from origin: ${origin || 'none'}`);
    console.log(`[CORS] Headers: ${JSON.stringify(req.headers, null, 2)}`);
  }
  
  next();
}; 