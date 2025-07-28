import { json, urlencoded } from "body-parser";
import express, { Request, Response } from "express";
import "express-async-errors";
import templateRouter from "./routes/template";
import auditorsRouter from "./routes/auditors";
import { TemplateService } from "./services/template";
import { createCorsMiddleware, securityHeaders, CorsConfig } from "./middlewares/cors";

const V1 = "/v1/";

// Init all routes, setup middlewares and dependencies
const initApp = (
  templateService: TemplateService,
  auditorsJSONFile: JSON,
  namesJSONFile: JSON,
  allowedOrigins: string = "*",
  allowCredentials: boolean = true
) => {
  const app = express();

  // Security headers (but keep permissive for public API)
  app.use(securityHeaders);

  // CORS configuration - allow anyone to call the service
  const corsConfig: CorsConfig = {
    allowedOrigins,
    allowCredentials
  };
  app.use(createCorsMiddleware(corsConfig));
  
  app.use(json());
  app.use(urlencoded({ extended: false }));

  // Welcome page at root
  app.get("/", async (req: Request, res: Response) => {
    const welcomeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flow Interaction Template Service</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 2rem; 
            line-height: 1.6; 
            background: #f8fafc;
        }
        .header { 
            text-align: center; 
            margin-bottom: 2rem; 
            padding: 2rem; 
            background: white; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status { 
            color: #10b981; 
            font-weight: bold; 
            font-size: 1.2rem;
        }
        .endpoints { 
            background: white; 
            padding: 2rem; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .endpoint { 
            margin: 1rem 0; 
            padding: 1rem; 
            border-left: 4px solid #3b82f6; 
            background: #f8fafc; 
            border-radius: 4px;
        }
        .method { 
            font-weight: bold; 
            color: #1f2937;
        }
        .get { color: #10b981; }
        .post { color: #f59e0b; }
        .url { 
            font-family: 'Monaco', 'Consolas', monospace; 
            background: #e5e7eb; 
            padding: 0.2rem 0.4rem; 
            border-radius: 3px;
        }
        .description { 
            color: #6b7280; 
            margin-top: 0.5rem;
        }
        .footer {
            text-align: center;
            margin-top: 2rem;
            color: #6b7280;
        }
        .cors-info {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem 0;
        }
        .cors-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Flow Interaction Template Service</h1>
        <div class="status">Service is running</div>
        <p>Serving Flow interaction templates via REST API</p>
    </div>
    
    <div class="cors-info">
        <div class="cors-title">CORS Configuration</div>
        <p>This service is configured to handle cross-origin requests from web applications.</p>
        <p><strong>Allowed Origins:</strong> ${allowedOrigins === "*" ? "All origins (*)" : allowedOrigins}</p>
        <p><strong>Credentials:</strong> ${allowCredentials ? "Allowed" : "Not allowed"}</p>
        <p><strong>Status:</strong> Anyone can call this service from any web application</p>
    </div>
    
    <div class="endpoints">
        <h2>Available Endpoints</h2>
        
        <div class="endpoint">
            <div class="method get">GET</div>
            <div class="url">/v1/templates?name={template_name}</div>
            <div class="description">Get template by name</div>
        </div>
        
        <div class="endpoint">
            <div class="method get">GET</div>
            <div class="url">/v1/templates/{template_id}</div>
            <div class="description">Get template by ID</div>
        </div>
        
        <div class="endpoint">
            <div class="method get">GET</div>
            <div class="url">/v1/templates/manifest</div>
            <div class="description">Get template manifest with all available templates</div>
        </div>
        
        <div class="endpoint">
            <div class="method post">POST</div>
            <div class="url">/v1/templates/search</div>
            <div class="description">Search template by Cadence code (requires cadence_base64 and network in body)</div>
        </div>
        
        <div class="endpoint">
            <div class="method get">GET</div>
            <div class="url">/v1/auditors?network={network}</div>
            <div class="description">Get auditors by network (mainnet/testnet)</div>
        </div>
    </div>
    
    <div class="footer">
        <p>Built for the Flow blockchain ecosystem</p>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(welcomeHTML);
  });

  app.use(V1, templateRouter(templateService, namesJSONFile));
  app.use(V1, auditorsRouter(auditorsJSONFile));

  app.all("*", async (req: Request, res: Response) => {
    return res.sendStatus(404);
  });

  return app;
};

export default initApp;
