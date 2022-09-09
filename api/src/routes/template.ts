import express, { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { TemplateService } from "../services/template";
import { genHash } from "../utils/gen-hash";
import { mixpanelTrack } from "../utils/mixpanel";
import { parseCadence } from "../utils/parse-cadence";

function templateRouter(templateService: TemplateService): Router {
  const router = express.Router();

  router.get("/templates/:template_id", async (req: Request, res: Response) => {
    const templateId = req.params.template_id;

    const template = await templateService.getTemplate(templateId);

    if (!template) {
      mixpanelTrack("get_template", {
        templateId,
        status: 204,
      });

      res.status(204);
      return res.send(
        `GET /templates/:template_id -- Did not find template for template_id=${templateId}`
      );
    }

    mixpanelTrack("get_template", {
      templateId,
      status: 200,
    });

    return res.send(template);
  });

  router.post("/templates/search", async (req: Request, res: Response) => {
    const cadence_base64 = req.body.cadence_base64 as string;
    const network = req.body.network as string;

    if (!cadence_base64) {
      res.status(400);
      return res.send(
        "POST /templates/search -- 'cadenceBase64' in request body not found"
      );
    }

    if (!network) {
      res.status(400);
      return res.send(
        "POST /templates/search -- 'network' in request body not found"
      );
    }

    let cadence = Buffer.from(cadence_base64, "base64").toString("utf8");
    let cadenceAST = await parseCadence(cadence);

    let template;
    try {
      template = await templateService.getTemplateByCadenceASTHash(
        await genHash(cadenceAST),
        network
      );
    } catch (e) {
      mixpanelTrack("search_template", {
        cadence_ast_hash: await genHash(cadenceAST),
        network,
        status: 400,
      });

      res.status(400);
      return res.send("GET /templates -- Error occured when getting template");
    }

    if (!template) {
      mixpanelTrack("search_template", {
        cadence_ast_hash: await genHash(cadenceAST),
        network,
        status: 204,
      });
      res.status(204);
      return res.send(
        `GET /templates -- Did not find template for network=${network} cadence=${cadence_base64}`
      );
    }

    mixpanelTrack("search_template", {
      cadence_ast_hash: await genHash(cadenceAST),
      network,
      found_template_id: template.id,
      status: 200,
    });

    return res.send(template);
  });

  return router;
}

export default templateRouter;
