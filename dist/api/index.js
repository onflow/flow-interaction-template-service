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
exports.default = handler;
// Import crypto polyfill first to ensure crypto.randomUUID is available
require("../src/utils/crypto-polyfill");
const fcl = __importStar(require("@onflow/fcl"));
const fs_1 = __importDefault(require("fs"));
const app_1 = __importDefault(require("../src/app"));
const config_1 = require("../src/config");
const template_1 = require("../src/services/template");
let app = null;
let isInitialized = false;
async function initializeApp() {
    if (isInitialized) {
        return app;
    }
    const config = (0, config_1.getConfig)(process.env);
    // Make sure we're pointing to the correct Flow Access API.
    fcl.config().put("accessNode.api", config.accessApi);
    const templateService = new template_1.TemplateService(config);
    console.log("Loading templates into memory...");
    try {
        await templateService.initialize();
        const templateCount = templateService.getTemplateCount();
        console.log(`Template loading complete! Loaded ${templateCount} templates.`);
        if (templateCount === 0) {
            console.error("WARNING: No templates were loaded! This will cause 204 responses.");
        }
    }
    catch (error) {
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
                if (fs_1.default.existsSync(auditorsPath)) {
                    auditorsJSONFile = JSON.parse(fs_1.default.readFileSync(auditorsPath, "utf8"));
                    console.log(`✅ Loaded auditors from ${auditorsPath} (${Object.keys(auditorsJSONFile).length} entries)`);
                    break;
                }
                else {
                    console.log(`❌ Auditors file not found: ${auditorsPath}`);
                }
            }
            catch (pathError) {
                console.log(`❌ Error reading auditors from ${auditorsPath}:`, pathError instanceof Error ? pathError.message : String(pathError));
                continue;
            }
        }
    }
    catch (e) {
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
                if (fs_1.default.existsSync(namesPath)) {
                    namesJSONFile = JSON.parse(fs_1.default.readFileSync(namesPath, "utf8"));
                    console.log(`✅ Loaded names from ${namesPath} (${Object.keys(namesJSONFile).length} mappings)`);
                    console.log(`   transfer-flow mapped to: ${namesJSONFile['transfer-flow'] || 'NOT FOUND'}`);
                    break;
                }
                else {
                    console.log(`❌ Names file not found: ${namesPath}`);
                }
            }
            catch (pathError) {
                console.log(`❌ Error reading names from ${namesPath}:`, pathError instanceof Error ? pathError.message : String(pathError));
                continue;
            }
        }
    }
    catch (e) {
        console.warn("Could not load names file:", e instanceof Error ? e.message : String(e));
    }
    app = (0, app_1.default)(templateService, auditorsJSONFile, namesJSONFile, config.allowedOrigins, config.allowCredentials);
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
async function handler(req, res) {
    try {
        const app = await initializeApp();
        return app(req, res);
    }
    catch (error) {
        console.error("Handler error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
