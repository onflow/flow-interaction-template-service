"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const InMemoryTemplateStorage_1 = require("../storage/InMemoryTemplateStorage");
class TemplateService {
    storage;
    config;
    constructor(config) {
        this.config = config;
        this.storage = new InMemoryTemplateStorage_1.InMemoryTemplateStorage(config);
    }
    async initialize() {
        await this.storage.initialize();
    }
    async getTemplate(templateId) {
        return this.storage.getTemplate(templateId);
    }
    async getTemplateByCadenceASTHash(cadenceASTHash, network) {
        return await this.storage.getTemplateByCadenceASTHash(cadenceASTHash, network);
    }
    async getTemplateManifest() {
        return this.storage.getTemplateManifest();
    }
    getTemplateCount() {
        return this.storage.getTemplateCount();
    }
}
exports.TemplateService = TemplateService;
