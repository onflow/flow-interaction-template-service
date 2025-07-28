import * as fcl from "@onflow/fcl";
import { InMemoryTemplateStorage } from "../storage/InMemoryTemplateStorage";

class TemplateService {
  private storage: InMemoryTemplateStorage;
  private config: any;

  constructor(config: any) {
    this.config = config;
    this.storage = new InMemoryTemplateStorage(config);
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  async getTemplate(templateId: string) {
    return this.storage.getTemplate(templateId);
  }

  async getTemplateByCadenceASTHash(cadenceASTHash: string, network: string) {
    return await this.storage.getTemplateByCadenceASTHash(cadenceASTHash, network);
  }

  async getTemplateManifest() {
    return this.storage.getTemplateManifest();
  }

  getTemplateCount(): number {
    return this.storage.getTemplateCount();
  }
}

export { TemplateService };
