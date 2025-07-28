"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mixpanel_1 = require("../utils/mixpanel");
function auditorsRouter(auditorsJSONFile) {
    const router = express_1.default.Router();
    router.get("/auditors", async (req, res) => {
        const network = req.query.network;
        if (!network) {
            (0, mixpanel_1.mixpanelTrack)("get_auditors", {
                network,
                status: 400,
            });
            res.status(400);
            return res.send("GET /auditors -- 'network' in request parameters not found");
        }
        if (typeof auditorsJSONFile[network] === "undefined") {
            (0, mixpanel_1.mixpanelTrack)("get_auditors", {
                network,
                status: 400,
            });
            res.status(400);
            return res.send("GET /auditors -- 'network' in request parameters not supported");
        }
        (0, mixpanel_1.mixpanelTrack)("get_auditors", {
            network,
            status: 200,
        });
        return res.send(auditorsJSONFile[network]);
    });
    return router;
}
exports.default = auditorsRouter;
