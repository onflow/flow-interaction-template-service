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
        let templateId = "";
        let _name = name;
        while (_name !== undefined) {
            let foundName = namesJSONFile[_name];
            if (foundName !== undefined)
                templateId = foundName;
            _name = foundName;
        }
        const template = await templateService.getTemplate(templateId);
        if (!template) {
            (0, mixpanel_1.mixpanelTrack)("get_template_by_name", {
                name,
                templateId,
                status: 204,
            });
            res.status(204);
            return res.send(`GET /templates/:template_id -- Did not find template for template_id=${templateId}`);
        }
        (0, mixpanel_1.mixpanelTrack)("get_template_by_name", {
            name,
            templateId,
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
    return router;
}
exports.default = templateRouter;
