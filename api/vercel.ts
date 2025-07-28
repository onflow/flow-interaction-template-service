// Import crypto polyfill first to ensure crypto.randomUUID is available
import "./src/utils/crypto-polyfill";
import * as fcl from "@onflow/fcl";
import fs from "fs";
import { VercelRequest, VercelResponse } from "@vercel/node";
import initApp from "./src/app";
import { getConfig } from "./src/config";
import initDB from "./src/db";
import { TemplateService } from "./src/services/template";

let app: any = null;
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) {
    return app;
  }

  const config = getConfig(process.env);
  const db = initDB(config);

  // Run all database migrations
  try {
    await db.migrate.latest();
  } catch (error) {
    console.log("Migration error (might be expected in serverless):", error instanceof Error ? error.message : error);
    // Continue execution even if migrations fail in serverless environment
  }

  // Make sure we're pointing to the correct Flow Access API.
  fcl.config().put("accessNode.api", config.accessApi);

  const templateService = new TemplateService(config);

  console.log("...Seeding TemplateService...");
  try {
    await templateService.seed();
    console.log("Seeded TemplateService!");
  } catch (error) {
    console.log("Seeding error (continuing anyway):", error instanceof Error ? error.message : error);
  }

  const auditorsJSONFile = config.auditorsJsonFile
    ? JSON.parse(fs.readFileSync(config.auditorsJsonFile, "utf8"))
    : {};

  const namesJSONFile = config.namesJsonFile
    ? JSON.parse(fs.readFileSync(config.namesJsonFile, "utf8"))
    : {};

  app = initApp(templateService, auditorsJSONFile, namesJSONFile);
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