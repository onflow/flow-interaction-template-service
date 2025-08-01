"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import crypto polyfill first to ensure crypto.randomUUID is available
require("./utils/crypto-polyfill");
const fcl = __importStar(require("@onflow/fcl"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("yargs/helpers");
const yargs_1 = __importDefault(require("yargs/yargs"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const template_1 = require("./services/template");
const cron = __importStar(require("cron"));
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
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
    const config = (0, config_1.getConfig)(envVars);
    // Make sure we're pointing to the correct Flow Access API.
    fcl.config().put("accessNode.api", config.accessApi);
    const startAPIServer = async () => {
        console.log("Starting API server with in-memory template storage...");
        const templateService = new template_1.TemplateService(config);
        console.log("Loading templates into memory...");
        await templateService.initialize();
        console.log(`Template loading complete! Loaded ${templateService.getTemplateCount()} templates.`);
        // Load name aliases from names.json
        if (config.namesJsonFile) {
            const namesJSONFile = JSON.parse(fs_1.default.readFileSync(config.namesJsonFile, "utf8"));
            templateService.loadNameAliases(namesJSONFile);
        }
        // Set up periodic reloading (optional - for dynamic updates if needed)
        const CronJob = cron.CronJob;
        const job = new CronJob("*/5 * * * *", async function () {
            console.log("Reloading templates...");
            await templateService.initialize();
            console.log(`Template reload complete! ${templateService.getTemplateCount()} templates loaded.`);
            // Reload name aliases
            if (config.namesJsonFile) {
                const namesJSONFile = JSON.parse(fs_1.default.readFileSync(config.namesJsonFile, "utf8"));
                templateService.loadNameAliases(namesJSONFile);
            }
        }, null, true, "America/Los_Angeles");
        const auditorsJSONFile = config.auditorsJsonFile
            ? JSON.parse(fs_1.default.readFileSync(config.auditorsJsonFile, "utf8"))
            : {};
        const namesJSONFile = config.namesJsonFile
            ? JSON.parse(fs_1.default.readFileSync(config.namesJsonFile, "utf8"))
            : {};
        const app = (0, app_1.default)(templateService, auditorsJSONFile, namesJSONFile, config.allowedOrigins, config.allowCredentials);
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
