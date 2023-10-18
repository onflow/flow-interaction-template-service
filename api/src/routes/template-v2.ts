import express, { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { TemplateService } from "../services/template";
import { genHash } from "../utils/gen-hash";
import { mixpanelTrack } from "../utils/mixpanel";
import { parseCadence } from "../utils/parse-cadence";

function templateRouter(
  templateService: TemplateService,
  namesJSONFile: JSON
): Router {
  const router = express.Router();

  router.get("/templates", async (req: Request, res: Response) => {
    const name = req.query.name as string;

    if (!name) {
      mixpanelTrack("get_template_by_name", {
        name,
        status: 400,
      });

      res.status(400);
      return res.send(
        `GET /templates-- Required query parameter "name" not provided.`
      );
    }

    let templateId: string = "";
    let _name: string = name;
    while (_name !== undefined) {
      let foundName = namesJSONFile[_name];
      if (foundName !== undefined) templateId = foundName;
      _name = foundName;
    }

    const template = await templateService.getTemplate(templateId);

    if (!template) {
      mixpanelTrack("get_template_by_name", {
        name,
        templateId,
        status: 204,
      });

      res.status(204);
      return res.send(
        `GET /templates/:template_id -- Did not find template for template_id=${templateId}`
      );
    }

    mixpanelTrack("get_template_by_name", {
      name,
      templateId,
      status: 200,
    });

    return res.send(template);
  });

  router.get("/templates/manifest", async (req: Request, res: Response) => {
    const templateManifest = await templateService.getTemplateManifest();

    if (!templateManifest) {
      mixpanelTrack("get_template_manifest", {
        status: 204,
      });

      res.status(204);
      return res.send(
        `GET /templates/manifest -- Did not find template manifest`
      );
    }

    mixpanelTrack("get_template_manifest", {
      status: 200,
    });

    return res.send(templateManifest);
  });

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

  router.post("/templates/search/messages", async (req: Request, res: Response) => {
    const page = req.body.page as number || undefined;
    const range = req.body.range as number || undefined;
    const searchMessagesTitleENUS = req.body.searchMessagesTitleENUS as string || undefined;
    const searchMessagesDescriptionENUS = req.body.searchMessagesDescriptionENUS as string || undefined;

    console.log("Searching messages...")
    console.log("page", page)
    console.log("range", range)
    console.log("searchMessagesTitleENUS", searchMessagesTitleENUS)
    console.log("searchMessagesDescriptionENUS", searchMessagesDescriptionENUS)

    try {
      const templates = await templateService.searchTemplates(
        page ?? 0,
        range ?? 100,
        searchMessagesTitleENUS,
        searchMessagesDescriptionENUS
      )
      return res.send(templates)

    } catch (e) {
      mixpanelTrack("search_template_messages", {
        page,
        range,
        searchMessagesTitleENUS,
        searchMessagesDescriptionENUS,
        status: 400,
      });
      res.status(400);
      return res.send("POST /templates/search/messages -- Error occurred when getting template");
    }
  })

  router.post("/templates/search/cadence", async (req: Request, res: Response) => {
    const cadence_base64 = req.body.cadence_base64 as string;
    const network = req.body.network as string

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
      return res.send("POST /templates/search/cadence -- Error occurred when getting template");
    }

    if (!template) {
      mixpanelTrack("search_template", {
        cadence_ast_hash: await genHash(cadenceAST),
        network,
        status: 204,
      });
      res.status(204);
      return res.send(
        `POST /templates/search/cadence -- Did not find template for network=${network} cadence=${cadence_base64}`
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
