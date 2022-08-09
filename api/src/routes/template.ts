import express, { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { TemplateService } from "../services/template";

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

  router.get("/templates", async (req: Request, res: Response) => {
    const base64EncodedCadence = req.query.cadence as string;
    const network = req.query.network as string;

    if (!base64EncodedCadence) {
      res.status(400);
      return res.send("GET /templates -- 'cadence' query param not found");
    }

    if (!network) {
      res.status(400);
      return res.send("GET /templates -- 'network' query param not found");
    }

    let cadence = base64EncodedCadence.replace(/ /gi, "+"); // "+" are replaced with " " from query param, this reverts this

    let template;
    try {
      template = await templateService.getTemplateByCadence(cadence, network);
    } catch (e) {
      res.status(400);
      return res.send("GET /templates -- Error occured when getting template");
    }

    if (!template) {
      res.status(204);
      return res.send(
        `GET /templates -- Did not find template for network=${network} cadence=${base64EncodedCadence}`
      );
    }

    return res.send(template);
  });

  return router;
}

export default templateRouter;
