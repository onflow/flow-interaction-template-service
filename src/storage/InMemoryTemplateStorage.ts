import * as fcl from "@onflow/fcl";
import fetch from "node-fetch";
import { readFiles } from "../utils/read-files";
import { writeFile } from "../utils/write-file";
import { genHash } from "../utils/gen-hash";
import { parseCadence } from "../utils/parse-cadence";

interface Template {
  id: string;
  json_string: string;
  testnet_cadence_ast_sha3_256_hash?: string;
  mainnet_cadence_ast_sha3_256_hash?: string;
  template_data: any;
}

export class InMemoryTemplateStorage {
  private templatesById: Map<string, Template> = new Map();
  private templatesByMainnetHash: Map<string, Template> = new Map();
  private templatesByTestnetHash: Map<string, Template> = new Map();
  private templateManifest: any = {};
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log("Loading templates into memory...");
    
    let templates: any[] = [];

    // Load local template files
    const localTemplates = (await readFiles(this.config.templateDir))
      .map((file: any) => file.content)
      .filter((file) => file !== null)
      .map((file) => JSON.parse(file));

    console.log(`Found ${localTemplates.length} local template files`);
    templates = templates.concat(localTemplates);

    // Load from peers if configured
    const peers = this.config.peers ? this.config.peers.split(",") : [];
    for (const peer of peers) {
      console.log(`Fetching peer ${peer}`);
      try {
        const manifest: any = await fetch(peer)
          .then((res) => (res.status === 200 ? res.json() : null))
          .catch((e) => null);
        if (manifest) {
          console.log(`Found manifest from ${peer} with ${Object.values(manifest).length} entries`);
          templates = templates.concat(Object.values(manifest));
        }
      } catch (e) {
        console.warn(`Failed to fetch from peer ${peer}:`, e);
      }
    }

    // Load existing manifest
    try {
      const existingManifest = (await readFiles(this.config.templateManifestFile))
        .map((file: any) => file.content)[0];
      if (existingManifest) {
        const parsed = JSON.parse(existingManifest);
        console.log(`Found local manifest with ${Object.values(parsed).length} templates`);
        templates = templates.concat(Object.values(parsed));
        this.templateManifest = parsed;
      }
    } catch (e) {
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
        const templateRecord: Template = {
          id: parsedTemplate.id,
          json_string: JSON.stringify(template),
          template_data: parsedTemplate,
        };

        this.templatesById.set(parsedTemplate.id, templateRecord);
        this.templateManifest[parsedTemplate.id] = parsedTemplate;

      } catch (e) {
        console.warn(`Skipping template due to error:`, e);
      }
    }

    // Write updated manifest
    try {
      await writeFile(
        this.config.templateManifestFile,
        JSON.stringify(this.templateManifest, null, 2)
      );
    } catch (e) {
      console.warn("Failed to write manifest file:", e);
    }

    console.log(`Successfully loaded ${this.templatesById.size} templates into memory`);
  }

  getTemplate(templateId: string): any | null {
    const template = this.templatesById.get(templateId);
    if (!template) return null;

    let templateJson = template.json_string;
    if (typeof templateJson === "string") {
      templateJson = JSON.parse(templateJson);
    }
    return templateJson;
  }

  async getTemplateByCadenceASTHash(cadenceASTHash: string, network: string): Promise<any | null> {
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
          const cadenceAST = await parseCadence(networkCadence);
          const templateHash = await genHash(cadenceAST);
          
          if (templateHash === cadenceASTHash) {
            return this.getTemplate(template.id);
          }
        }
      } catch (e) {
        // Skip templates with parsing errors
        continue;
      }
    }
    
    return null;
  }

  getTemplateManifest(): any {
    return this.templateManifest;
  }

  getTemplateCount(): number {
    return this.templatesById.size;
  }
} 