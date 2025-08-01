// Import crypto polyfill first to ensure crypto.randomUUID is available
import "../src/utils/crypto-polyfill";
import * as fcl from "@onflow/fcl";
import fs from "fs";
import { VercelRequest, VercelResponse } from "@vercel/node";
import initApp from "../src/app";
import { getConfig } from "../src/config";
import { TemplateService } from "../src/services/template";

let app: any = null;
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) {
    return app;
  }

  const config = getConfig(process.env);

  // Make sure we're pointing to the correct Flow Access API.
  fcl.config().put("accessNode.api", config.accessApi);

  const templateService = new TemplateService(config);

  console.log("Loading templates into memory...");
  try {
    await templateService.initialize();
    console.log(`Template loading complete! Loaded ${templateService.getTemplateCount()} templates.`);
  } catch (error) {
    console.error("Template loading error:", error instanceof Error ? error.message : error);
    throw error; // Re-throw since templates are critical
  }

  // Load auditors file with robust path resolution
  let auditorsJSONFile = {};
  if (config.auditorsJsonFile) {
    try {
      const path = require("path");
      const possibleAuditorsPaths = [
        config.auditorsJsonFile,
        path.join(process.cwd(), config.auditorsJsonFile),
        path.join(__dirname, "../", config.auditorsJsonFile),
        path.join(__dirname, "../../", config.auditorsJsonFile)
      ];
      
      for (const auditorsPath of possibleAuditorsPaths) {
        try {
          if (fs.existsSync(auditorsPath)) {
            auditorsJSONFile = JSON.parse(fs.readFileSync(auditorsPath, "utf8"));
            console.log(`Loaded auditors from ${auditorsPath}`);
            break;
          }
        } catch (pathError) {
          continue;
        }
      }
    } catch (e) {
      console.warn("Could not load auditors file:", e instanceof Error ? e.message : String(e));
    }
  }

  // Load names file with robust path resolution  
  let namesJSONFile = {};
  if (config.namesJsonFile) {
    try {
      const path = require("path");
      const possibleNamesPaths = [
        config.namesJsonFile,
        path.join(process.cwd(), config.namesJsonFile),
        path.join(__dirname, "../", config.namesJsonFile),
        path.join(__dirname, "../../", config.namesJsonFile)
      ];
      
      for (const namesPath of possibleNamesPaths) {
        try {
          if (fs.existsSync(namesPath)) {
            namesJSONFile = JSON.parse(fs.readFileSync(namesPath, "utf8"));
            console.log(`Loaded names from ${namesPath}`);
            break;
          }
        } catch (pathError) {
          continue;
        }
      }
    } catch (e) {
      console.warn("Could not load names file:", e instanceof Error ? e.message : String(e));
    }
  }

  app = initApp(
    templateService, 
    auditorsJSONFile, 
    namesJSONFile,
    config.allowedOrigins,
    config.allowCredentials
  );
  isInitialized = true;

  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
} 