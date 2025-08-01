import * as fcl from "@onflow/fcl";
import { InMemoryTemplateStorage } from "../storage/InMemoryTemplateStorage";
import { SearchFilters } from "./templateIndex";

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

  /**
   * Load name aliases into the template index
   */
  public loadNameAliases(namesJson: any): void {
    this.storage.loadNameAliases(namesJson);
  }

  /**
   * Search templates using various filters
   */
  public searchTemplates(filters: SearchFilters): any[] {
    return this.storage.searchTemplates(filters);
  }

  /**
   * Get template by name using the index
   */
  public getTemplateByName(name: string): any | null {
    return this.storage.getTemplateByName(name);
  }

  /**
   * Get all names for a template ID
   */
  public getNamesForTemplate(templateId: string): string[] {
    return this.storage.getNamesForTemplate(templateId);
  }

  /**
   * Get index statistics
   */
  public getIndexStats(): any {
    return this.storage.getIndexStats();
  }
}

export { TemplateService };
