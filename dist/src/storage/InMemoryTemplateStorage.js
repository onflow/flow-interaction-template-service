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
exports.InMemoryTemplateStorage = void 0;
const fcl = __importStar(require("@onflow/fcl"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const read_files_1 = require("../utils/read-files");
const write_file_1 = require("../utils/write-file");
const gen_hash_1 = require("../utils/gen-hash");
const parse_cadence_1 = require("../utils/parse-cadence");
class InMemoryTemplateStorage {
    templatesById = new Map();
    templatesByMainnetHash = new Map();
    templatesByTestnetHash = new Map();
    templateManifest = {};
    config;
    constructor(config) {
        this.config = config;
    }
    async initialize() {
        console.log("Loading templates into memory...");
        let templates = [];
        // Try to load pre-built templates first (for Vercel/production)
        try {
            const path = require("path");
            const fs = require("fs");
            // Try multiple possible paths for the pre-built templates
            const possiblePaths = [
                path.join(__dirname, "../../dist/templates.json"),
                path.join(__dirname, "../../../dist/templates.json"),
                path.join(process.cwd(), "dist/templates.json"),
                "./dist/templates.json"
            ];
            let preBuiltTemplates = null;
            for (const templatePath of possiblePaths) {
                try {
                    if (fs.existsSync(templatePath)) {
                        preBuiltTemplates = JSON.parse(fs.readFileSync(templatePath, "utf8"));
                        console.log(`✅ Found ${preBuiltTemplates?.length || 0} pre-built templates at ${templatePath}`);
                        break;
                    }
                    else {
                        console.log(`❌ Pre-built templates not found: ${templatePath}`);
                    }
                }
                catch (pathError) {
                    console.log(`❌ Error reading templates from ${templatePath}:`, pathError instanceof Error ? pathError.message : String(pathError));
                    continue;
                }
            }
            if (preBuiltTemplates) {
                templates = templates.concat(preBuiltTemplates);
            }
            else {
                throw new Error("No pre-built templates found");
            }
        }
        catch (e) {
            // Fallback to glob loading (for development)
            console.log("Pre-built templates not found, using glob loading...", e instanceof Error ? e.message : String(e));
            const localTemplates = (await (0, read_files_1.readFiles)(this.config.templateDir))
                .map((file) => file.content)
                .filter((file) => file !== null)
                .map((file) => JSON.parse(file));
            console.log(`Found ${localTemplates.length} local template files`);
            templates = templates.concat(localTemplates);
        }
        // Load from peers if configured
        const peers = this.config.peers ? this.config.peers.split(",") : [];
        for (const peer of peers) {
            console.log(`Fetching peer ${peer}`);
            try {
                const manifest = await (0, node_fetch_1.default)(peer)
                    .then((res) => (res.status === 200 ? res.json() : null))
                    .catch((e) => null);
                if (manifest) {
                    console.log(`Found manifest from ${peer} with ${Object.values(manifest).length} entries`);
                    templates = templates.concat(Object.values(manifest));
                }
            }
            catch (e) {
                console.warn(`Failed to fetch from peer ${peer}:`, e);
            }
        }
        // Load existing manifest
        try {
            // Try pre-built manifest first
            let existingManifest;
            try {
                const path = require("path");
                const fs = require("fs");
                const possibleManifestPaths = [
                    path.join(__dirname, "../../dist/template-manifest.json"),
                    path.join(__dirname, "../../../dist/template-manifest.json"),
                    path.join(process.cwd(), "dist/template-manifest.json"),
                    "./dist/template-manifest.json"
                ];
                for (const manifestPath of possibleManifestPaths) {
                    try {
                        if (fs.existsSync(manifestPath)) {
                            existingManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
                            console.log(`Found pre-built manifest with ${Object.values(existingManifest).length} templates at ${manifestPath}`);
                            break;
                        }
                    }
                    catch (pathError) {
                        continue;
                    }
                }
                if (!existingManifest) {
                    throw new Error("No pre-built manifest found");
                }
            }
            catch (e) {
                // Fallback to file-based manifest
                try {
                    const manifestFiles = await (0, read_files_1.readFiles)(this.config.templateManifestFile);
                    if (manifestFiles.length > 0) {
                        existingManifest = JSON.parse(manifestFiles[0].content);
                        console.log(`Found local manifest with ${Object.values(existingManifest).length} templates`);
                    }
                }
                catch (manifestError) {
                    console.log("No manifest found:", e instanceof Error ? e.message : String(e));
                }
            }
            if (existingManifest) {
                templates = templates.concat(Object.values(existingManifest));
                this.templateManifest = existingManifest;
            }
        }
        catch (e) {
            console.log("No existing manifest found, creating new one");
        }
        console.log(`Processing ${templates.length} templates`);
        // Process templates
        for (const template of templates) {
            try {
                const parsedTemplate = typeof template === "object" ? template : JSON.parse(template);
                if (parsedTemplate.f_type !== "InteractionTemplate" || parsedTemplate.f_version !== "1.0.0") {
                    continue;
                }
                const recomputedTemplateID = await fcl.InteractionTemplateUtils.generateTemplateId({
                    template: parsedTemplate,
                });
                if (recomputedTemplateID !== parsedTemplate.id) {
                    console.warn(`Template ID mismatch: recomputed=${recomputedTemplateID} template=${parsedTemplate.id}`);
                    // Use the recomputed ID to fix the mismatch
                    parsedTemplate.id = recomputedTemplateID;
                    console.log(`✅ Fixed template ID to: ${recomputedTemplateID}`);
                }
                if (this.templatesById.has(parsedTemplate.id)) {
                    console.log(`Skipping duplicate template with ID = ${parsedTemplate.id}`);
                    continue;
                }
                // Store template
                const templateRecord = {
                    id: parsedTemplate.id,
                    json_string: JSON.stringify(template),
                    template_data: parsedTemplate,
                };
                this.templatesById.set(parsedTemplate.id, templateRecord);
                this.templateManifest[parsedTemplate.id] = parsedTemplate;
            }
            catch (e) {
                console.warn(`Skipping template due to error:`, e);
            }
        }
        // Write updated manifest (skip in production/Vercel)
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            try {
                await (0, write_file_1.writeFile)(this.config.templateManifestFile, JSON.stringify(this.templateManifest, null, 2));
            }
            catch (e) {
                console.warn("Failed to write manifest file (this is normal in production):", e instanceof Error ? e.message : String(e));
            }
        }
        console.log(`Successfully loaded ${this.templatesById.size} templates into memory`);
    }
    getTemplate(templateId) {
        const template = this.templatesById.get(templateId);
        if (!template)
            return null;
        let templateJson = template.json_string;
        if (typeof templateJson === "string") {
            templateJson = JSON.parse(templateJson);
        }
        return templateJson;
    }
    async getTemplateByCadenceASTHash(cadenceASTHash, network) {
        // For now, we'll search through all templates since we don't pre-compute the hashes
        // This could be optimized later if needed
        for (const template of this.templatesById.values()) {
            try {
                const templateData = template.template_data;
                // Check if template has cadence for the specified network
                const networkCadence = network === "mainnet"
                    ? templateData.data?.cadence
                    : templateData.data?.cadence; // Simplified - you might have network-specific cadence
                if (networkCadence) {
                    const cadenceAST = await (0, parse_cadence_1.parseCadence)(networkCadence);
                    const templateHash = await (0, gen_hash_1.genHash)(cadenceAST);
                    if (templateHash === cadenceASTHash) {
                        return this.getTemplate(template.id);
                    }
                }
            }
            catch (e) {
                // Skip templates with parsing errors
                continue;
            }
        }
        return null;
    }
    getTemplateManifest() {
        return this.templateManifest;
    }
    getTemplateCount() {
        return this.templatesById.size;
    }
}
exports.InMemoryTemplateStorage = InMemoryTemplateStorage;
