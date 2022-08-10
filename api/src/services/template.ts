import * as fcl from "@onflow/fcl";
import { Template } from "../models/template";
import { readFiles } from "../utils/read-files";

class TemplateService {
  config: any;

  constructor(config: any) {
    this.config = config;
  }

  async insertTemplate(template: string) {
    let newTemplate: Template;

    let templateJSON = JSON.parse(template);

    newTemplate = await Template.query().insertAndFetch({
      id: templateJSON.id,
      json_string: template,
    });

    return newTemplate;
  }

  async getTemplate(templateId: string) {
    let foundTemplate: Template;

    foundTemplate = (
      await Template.query().where({
        id: templateId,
      })
    )[0];

    let foundTemplateJson = foundTemplate?.json_string || null;

    if (typeof foundTemplateJson === "string") {
      foundTemplateJson = JSON.parse(foundTemplateJson);
    }

    return foundTemplateJson;
  }

  async getTemplateByCadence(base64Cadence: string, network: string) {
    let foundTemplate: Template | null = null;

    if (network === "mainnet") {
      foundTemplate = (
        await Template.query().where({
          mainnet_cadence: base64Cadence,
        })
      )[0];
    } else if (network === "testnet") {
      foundTemplate = (
        await Template.query().where({
          testnet_cadence: base64Cadence,
        })
      )[0];
    }

    let foundTemplateJson = foundTemplate?.json_string || null;

    if (typeof foundTemplateJson === "string") {
      foundTemplateJson = JSON.parse(foundTemplateJson);
    }

    return foundTemplateJson;
  }

  async seed() {
    const templates = await readFiles(this.config.templateDir + "/*.json");

    await Template.query().del();

    for (let template of templates) {
      try {
        let parsedTemplate = JSON.parse(template.content);

        let mainnet_cadence =
          fcl.InteractionTemplateUtils.deriveCadenceByNetwork({
            template: parsedTemplate,
            network: "mainnet",
          });

        let testnet_cadence =
          fcl.InteractionTemplateUtils.deriveCadenceByNetwork({
            template: parsedTemplate,
            network: "testnet",
          });

        const recomputedTemplateID =
          await fcl.InteractionTemplateUtils.generateTemplateId({
            template: parsedTemplate,
          });
        if (recomputedTemplateID !== parsedTemplate.id)
          throw new Error(
            `recomputed=${recomputedTemplateID} template=${parsedTemplate.id}`
          );

        await Template.query().insertAndFetch({
          id: parsedTemplate.id,
          json_string: template.content,
          mainnet_cadence: Buffer.from(mainnet_cadence).toString("base64"),
          testnet_cadence: Buffer.from(testnet_cadence).toString("base64"),
        });
      } catch (e) {
        console.warn(`Skipping template ${template.path} error=${e}`);
      }
    }
  }
}

export { TemplateService };
