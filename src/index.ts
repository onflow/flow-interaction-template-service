// Import crypto polyfill first to ensure crypto.randomUUID is available
import "./utils/crypto-polyfill";
import * as fcl from "@onflow/fcl";
import fs from "fs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import initApp from "./app";
import { getConfig } from "./config";
import { TemplateService } from "./services/template";
import * as cron from "cron";

const argv = yargs(hideBin(process.argv)).argv as any;
const DEV = argv.dev;

// Handle unhandled promise rejections to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

let envVars;

if (DEV) {
  const env = require("dotenv");
  const expandEnv = require("dotenv-expand").expand;

  const config = env.config({
    path: process.cwd() + "/.env.local",
  });

  expandEnv(config);
  console.log("CONFIG", config);
  envVars = config.parsed;
}

async function run() {
  const config = getConfig(envVars);

  // Make sure we're pointing to the correct Flow Access API.
  fcl.config().put("accessNode.api", config.accessApi);

  const startAPIServer = async () => {
    console.log("Starting API server with in-memory template storage...");
    const templateService = new TemplateService(config);

    console.log("Loading templates into memory...");
    await templateService.initialize();
    console.log(`Template loading complete! Loaded ${templateService.getTemplateCount()} templates.`);
    
    // Load name aliases from names.json
    if (config.namesJsonFile) {
      const namesJSONFile = JSON.parse(fs.readFileSync(config.namesJsonFile, "utf8"));
      templateService.loadNameAliases(namesJSONFile);
    }

    // Set up periodic reloading (optional - for dynamic updates if needed)
    const CronJob = cron.CronJob;
    const job = new CronJob(
      "*/5 * * * *",
      async function () {
        console.log("Reloading templates...");
        await templateService.initialize();
        console.log(`Template reload complete! ${templateService.getTemplateCount()} templates loaded.`);
        
        // Reload name aliases
        if (config.namesJsonFile) {
          const namesJSONFile = JSON.parse(fs.readFileSync(config.namesJsonFile, "utf8"));
          templateService.loadNameAliases(namesJSONFile);
        }
      },
      null,
      true,
      "America/Los_Angeles"
    );

    const auditorsJSONFile = config.auditorsJsonFile
      ? JSON.parse(fs.readFileSync(config.auditorsJsonFile, "utf8"))
      : {};

    const namesJSONFile = config.namesJsonFile
      ? JSON.parse(fs.readFileSync(config.namesJsonFile, "utf8"))
      : {};

    const app = initApp(
      templateService, 
      auditorsJSONFile, 
      namesJSONFile,
      config.allowedOrigins,
      config.allowCredentials
    );

    app.listen(config.port, () => {
      console.log(`Listening on port ${config.port}!`);
      console.log(`CORS configured for origins: ${config.allowedOrigins}`);
    });
  };

  await startAPIServer();
}

run().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
