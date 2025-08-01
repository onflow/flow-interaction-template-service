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
    const templateCount = templateService.getTemplateCount();
    console.log(`Template loading complete! Loaded ${templateCount} templates.`);
    
    if (templateCount === 0) {
      console.error("WARNING: No templates were loaded! This will cause 204 responses.");
    }
  } catch (error) {
    console.error("Template loading error:", error instanceof Error ? error.message : error);
    throw error; // Re-throw since templates are critical
  }

  // Load auditors file with robust path resolution
  let auditorsJSONFile = {};
  try {
    const path = require("path");
    const possibleAuditorsPaths = [
      // Try dist first for Vercel
      path.join(__dirname, "../dist/auditors.json"),
      path.join(process.cwd(), "dist/auditors.json"),
      // Fallback to original paths
      config.auditorsJsonFile,
      path.join(process.cwd(), config.auditorsJsonFile),
      path.join(__dirname, "../", config.auditorsJsonFile),
      path.join(__dirname, "../../", config.auditorsJsonFile)
    ];
    
    for (const auditorsPath of possibleAuditorsPaths) {
      try {
        if (fs.existsSync(auditorsPath)) {
          auditorsJSONFile = JSON.parse(fs.readFileSync(auditorsPath, "utf8"));
          console.log(`✅ Loaded auditors from ${auditorsPath} (${Object.keys(auditorsJSONFile).length} entries)`);
          break;
        } else {
          console.log(`❌ Auditors file not found: ${auditorsPath}`);
        }
      } catch (pathError) {
        console.log(`❌ Error reading auditors from ${auditorsPath}:`, pathError instanceof Error ? pathError.message : String(pathError));
        continue;
      }
    }
  } catch (e) {
    console.warn("Could not load auditors file:", e instanceof Error ? e.message : String(e));
  }

  // Load names file with robust path resolution  
  let namesJSONFile = {};
  try {
    const path = require("path");
    const possibleNamesPaths = [
      // Try dist first for Vercel
      path.join(__dirname, "../dist/names.json"),
      path.join(process.cwd(), "dist/names.json"),
      // Fallback to original paths
      config.namesJsonFile,
      path.join(process.cwd(), config.namesJsonFile),
      path.join(__dirname, "../", config.namesJsonFile),
      path.join(__dirname, "../../", config.namesJsonFile)
    ];
    
    for (const namesPath of possibleNamesPaths) {
      try {
        if (fs.existsSync(namesPath)) {
          namesJSONFile = JSON.parse(fs.readFileSync(namesPath, "utf8"));
          console.log(`✅ Loaded names from ${namesPath} (${Object.keys(namesJSONFile).length} mappings)`);
          console.log(`   transfer-flow mapped to: ${namesJSONFile['transfer-flow'] || 'NOT FOUND'}`);
          break;
        } else {
          console.log(`❌ Names file not found: ${namesPath}`);
        }
      } catch (pathError) {
        console.log(`❌ Error reading names from ${namesPath}:`, pathError instanceof Error ? pathError.message : String(pathError));
        continue;
      }
    }
  } catch (e) {
    console.warn("Could not load names file:", e instanceof Error ? e.message : String(e));
  }

  app = initApp(
    templateService, 
    auditorsJSONFile, 
    namesJSONFile,
    config.allowedOrigins,
    config.allowCredentials
  );

  // Log initialization results
  console.log(`🔍 Initialization Summary:`);
  console.log(`   Templates loaded: ${templateService.getTemplateCount()}`);
  console.log(`   Names mappings: ${Object.keys(namesJSONFile).length}`);
  console.log(`   Auditors entries: ${Object.keys(auditorsJSONFile).length}`);
  console.log(`   transfer-flow mapping: ${namesJSONFile['transfer-flow'] || 'MISSING'}`);
  console.log(`   Working directory: ${process.cwd()}`);
  console.log(`   __dirname: ${__dirname}`);

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