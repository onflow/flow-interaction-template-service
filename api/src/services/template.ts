import * as fcl from "@onflow/fcl";
import { Template } from "../models/template";
import { readFiles } from "../utils/read-files";
import { genHash } from "../utils/gen-hash";
import { parseCadence } from "../utils/parse-cadence";

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

  async getTemplateByCadenceASTHash(cadenceASTHash: string, network: string) {
    let foundTemplate: Template | null = null;

    if (network === "mainnet") {
      foundTemplate = (
        await Template.query().where({
          mainnet_cadence_ast_sha3_256_hash: cadenceASTHash,
        })
      )[0];
    } else if (network === "testnet") {
      foundTemplate = (
        await Template.query().where({
          testnet_cadence_ast_sha3_256_hash: cadenceASTHash,
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
    const templates = await readFiles(this.config.templateDir);

    await Template.query().del();

    for (let template of templates) {
      try {
        let parsedTemplate = JSON.parse(template.content);

        let mainnet_cadence;
        try {
          mainnet_cadence = fcl.InteractionTemplateUtils.deriveCadenceByNetwork(
            {
              template: parsedTemplate,
              network: "mainnet",
            }
          );
        } catch (e) {}

        let testnet_cadence;
        try {
          testnet_cadence = fcl.InteractionTemplateUtils.deriveCadenceByNetwork(
            {
              template: parsedTemplate,
              network: "testnet",
            }
          );
        } catch (e) {}

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
          mainnet_cadence_ast_sha3_256_hash: mainnet_cadence
            ? await genHash(await parseCadence(mainnet_cadence))
            : undefined,
          testnet_cadence_ast_sha3_256_hash: testnet_cadence
            ? await genHash(await parseCadence(testnet_cadence))
            : undefined,
        });
      } catch (e) {
        console.warn(`Skipping template ${template.path} error=${e}`);
      }
    }
  }
}

export { TemplateService };
