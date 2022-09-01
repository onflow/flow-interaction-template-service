import express, { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { TemplateService } from "../services/template";
import { genHash } from "../utils/gen-hash";

function templateRouter(templateService: TemplateService): Router {
  const router = express.Router();

  router.get("/templates/:template_id", async (req: Request, res: Response) => {
    const templateId = req.params.template_id;

    const template = await templateService.getTemplate(templateId);

    if (!template) {
      res.status(204);
      return res.send(
        `GET /templates/:template_id -- Did not find template for template_id=${templateId}`
      );
    }

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

    let template;
    try {
      template = await templateService.getTemplateByCadence(
        await genHash(cadence),
        network
      );
    } catch (e) {
      res.status(400);
      return res.send("GET /templates -- Error occured when getting template");
    }

    if (!template) {
      res.status(204);
      return res.send(
        `GET /templates -- Did not find template for network=${network} cadence=${cadence_base64}`
      );
    }

    return res.send(template);
  });

  return router;
}

export default templateRouter;
