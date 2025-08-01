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
        // Load local template files
        const localTemplates = (await (0, read_files_1.readFiles)(this.config.templateDir))
            .map((file) => file.content)
            .filter((file) => file !== null)
            .map((file) => JSON.parse(file));
        console.log(`Found ${localTemplates.length} local template files`);
        templates = templates.concat(localTemplates);
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
            const existingManifest = (await (0, read_files_1.readFiles)(this.config.templateManifestFile))
                .map((file) => file.content)[0];
            if (existingManifest) {
                const parsed = JSON.parse(existingManifest);
                console.log(`Found local manifest with ${Object.values(parsed).length} templates`);
                templates = templates.concat(Object.values(parsed));
                this.templateManifest = parsed;
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
                    continue;
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
        // Write updated manifest
        try {
            await (0, write_file_1.writeFile)(this.config.templateManifestFile, JSON.stringify(this.templateManifest, null, 2));
        }
        catch (e) {
            console.warn("Failed to write manifest file:", e);
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
