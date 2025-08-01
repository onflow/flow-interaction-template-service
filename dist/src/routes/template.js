"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gen_hash_1 = require("../utils/gen-hash");
const mixpanel_1 = require("../utils/mixpanel");
const parse_cadence_1 = require("../utils/parse-cadence");
function templateRouter(templateService, namesJSONFile) {
    const router = express_1.default.Router();
    router.get("/templates", async (req, res) => {
        const name = req.query.name;
        if (!name) {
            (0, mixpanel_1.mixpanelTrack)("get_template_by_name", {
                name,
                status: 400,
            });
            res.status(400);
            return res.send(`GET /templates-- Required query parameter "name" not provided.`);
        }
        // Use the new indexing system to get template by name
        const template = await templateService.getTemplateByName(name);
        if (!template) {
            // Fallback to old names.json system for compatibility
            let templateId = "";
            let _name = name;
            while (_name !== undefined) {
                let foundName = namesJSONFile[_name];
                if (foundName !== undefined)
                    templateId = foundName;
                _name = foundName;
            }
            const fallbackTemplate = await templateService.getTemplate(templateId);
            if (!fallbackTemplate) {
                (0, mixpanel_1.mixpanelTrack)("get_template_by_name", {
                    name,
                    templateId,
                    status: 204,
                });
                res.status(204);
                return res.send(`GET /templates -- Did not find template for name=${name}`);
            }
            (0, mixpanel_1.mixpanelTrack)("get_template_by_name", {
                name,
                templateId,
                method: "fallback",
                status: 200,
            });
            return res.send(fallbackTemplate);
        }
        (0, mixpanel_1.mixpanelTrack)("get_template_by_name", {
            name,
            method: "index",
            status: 200,
        });
        return res.send(template);
    });
    router.get("/templates/manifest", async (req, res) => {
        const templateManifest = await templateService.getTemplateManifest();
        if (!templateManifest) {
            (0, mixpanel_1.mixpanelTrack)("get_template_manifest", {
                status: 204,
            });
            res.status(204);
            return res.send(`GET /templates/manifest -- Did not find template manifest`);
        }
        (0, mixpanel_1.mixpanelTrack)("get_template_manifest", {
            status: 200,
        });
        return res.send(templateManifest);
    });
    router.get("/templates/:template_id", async (req, res) => {
        const templateId = req.params.template_id;
        const template = await templateService.getTemplate(templateId);
        if (!template) {
            (0, mixpanel_1.mixpanelTrack)("get_template", {
                templateId,
                status: 204,
            });
            res.status(204);
            return res.send(`GET /templates/:template_id -- Did not find template for template_id=${templateId}`);
        }
        (0, mixpanel_1.mixpanelTrack)("get_template", {
            templateId,
            status: 200,
        });
        return res.send(template);
    });
    router.post("/templates/search", async (req, res) => {
        const cadence_base64 = req.body.cadence_base64;
        const network = req.body.network;
        if (!cadence_base64) {
            res.status(400);
            return res.send("POST /templates/search -- 'cadenceBase64' in request body not found");
        }
        if (!network) {
            res.status(400);
            return res.send("POST /templates/search -- 'network' in request body not found");
        }
        let cadence = Buffer.from(cadence_base64, "base64").toString("utf8");
        let cadenceAST = await (0, parse_cadence_1.parseCadence)(cadence);
        let template;
        try {
            template = await templateService.getTemplateByCadenceASTHash(await (0, gen_hash_1.genHash)(cadenceAST), network);
        }
        catch (e) {
            (0, mixpanel_1.mixpanelTrack)("search_template", {
                cadence_ast_hash: await (0, gen_hash_1.genHash)(cadenceAST),
                network,
                status: 400,
            });
            res.status(400);
            return res.send("GET /templates -- Error occured when getting template");
        }
        if (!template) {
            (0, mixpanel_1.mixpanelTrack)("search_template", {
                cadence_ast_hash: await (0, gen_hash_1.genHash)(cadenceAST),
                network,
                status: 204,
            });
            res.status(204);
            return res.send(`GET /templates -- Did not find template for network=${network} cadence=${cadence_base64}`);
        }
        (0, mixpanel_1.mixpanelTrack)("search_template", {
            cadence_ast_hash: await (0, gen_hash_1.genHash)(cadenceAST),
            network,
            found_template_id: template.id,
            status: 200,
        });
        return res.send(template);
    });
    // New advanced search endpoint
    router.get("/templates/search", async (req, res) => {
        const filters = {};
        // Extract search parameters
        if (req.query.name)
            filters.name = req.query.name;
        if (req.query.title)
            filters.title = req.query.title;
        if (req.query.description)
            filters.description = req.query.description;
        if (req.query.type)
            filters.type = req.query.type;
        if (req.query.hasArgument)
            filters.hasArgument = req.query.hasArgument;
        if (req.query.argumentType)
            filters.argumentType = req.query.argumentType;
        if (req.query.dependency)
            filters.dependency = req.query.dependency;
        if (req.query.cadenceContains)
            filters.cadenceContains = req.query.cadenceContains;
        try {
            const results = await templateService.searchTemplates(filters);
            (0, mixpanel_1.mixpanelTrack)("search_templates", {
                filters: JSON.stringify(filters),
                resultsCount: results.length,
                status: 200,
            });
            return res.send(results);
        }
        catch (error) {
            (0, mixpanel_1.mixpanelTrack)("search_templates", {
                filters: JSON.stringify(filters),
                error: error instanceof Error ? error.message : "Unknown error",
                status: 500,
            });
            res.status(500);
            return res.send("Error searching templates");
        }
    });
    // Get template names endpoint
    router.get("/templates/:template_id/names", async (req, res) => {
        const templateId = req.params.template_id;
        try {
            const names = templateService.getNamesForTemplate(templateId);
            (0, mixpanel_1.mixpanelTrack)("get_template_names", {
                templateId,
                namesCount: names.length,
                status: 200,
            });
            return res.send({ templateId, names });
        }
        catch (error) {
            (0, mixpanel_1.mixpanelTrack)("get_template_names", {
                templateId,
                error: error instanceof Error ? error.message : "Unknown error",
                status: 500,
            });
            res.status(500);
            return res.send("Error getting template names");
        }
    });
    // Get index statistics endpoint
    router.get("/templates/stats", async (req, res) => {
        try {
            const stats = templateService.getIndexStats();
            (0, mixpanel_1.mixpanelTrack)("get_template_stats", {
                stats: JSON.stringify(stats),
                status: 200,
            });
            return res.send(stats);
        }
        catch (error) {
            (0, mixpanel_1.mixpanelTrack)("get_template_stats", {
                error: error instanceof Error ? error.message : "Unknown error",
                status: 500,
            });
            res.status(500);
            return res.send("Error getting template statistics");
        }
    });
    return router;
}
exports.default = templateRouter;
