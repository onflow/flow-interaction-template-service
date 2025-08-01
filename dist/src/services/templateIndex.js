"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateIndexService = void 0;
// Simple console logger - replace with proper logger if needed
const logger = {
    info: (message) => console.log(`[INFO] ${message}`),
    warn: (message) => console.warn(`[WARN] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`)
};
class TemplateIndexService {
    idIndex = new Map();
    nameIndex = new Map(); // name -> id
    titleIndex = new Map(); // title -> set of ids
    typeIndex = new Map(); // type -> set of ids
    argumentIndex = new Map(); // arg name -> set of ids
    dependencyIndex = new Map(); // contract -> set of ids
    fullTextIndex = new Map(); // word -> set of ids
    /**
     * Add a template to all indexes
     */
    indexTemplate(template, names = []) {
        const indexed = this.extractIndexableFields(template);
        // Add provided names
        names.forEach(name => indexed.names.add(name));
        // Store in main index
        this.idIndex.set(indexed.id, indexed);
        // Index by names
        indexed.names.forEach(name => {
            this.nameIndex.set(name.toLowerCase(), indexed.id);
        });
        // Index by title
        this.addToSetIndex(this.titleIndex, indexed.title.toLowerCase(), indexed.id);
        // Index by type
        this.addToSetIndex(this.typeIndex, indexed.type, indexed.id);
        // Index by arguments
        indexed.arguments.forEach(arg => {
            this.addToSetIndex(this.argumentIndex, arg.toLowerCase(), indexed.id);
        });
        // Index by dependencies
        indexed.dependencies.forEach(dep => {
            this.addToSetIndex(this.dependencyIndex, dep.toLowerCase(), indexed.id);
        });
        // Full-text indexing (simple word-based)
        this.indexFullText(indexed);
    }
    /**
     * Add a name alias to an existing template
     */
    addNameAlias(templateId, name) {
        const indexed = this.idIndex.get(templateId);
        if (!indexed) {
            logger.warn(`Cannot add name alias "${name}" - template ${templateId} not found`);
            return false;
        }
        indexed.names.add(name);
        this.nameIndex.set(name.toLowerCase(), templateId);
        return true;
    }
    /**
     * Search templates by various criteria
     */
    search(filters) {
        let resultIds = null;
        // Search by name (exact match)
        if (filters.name) {
            const id = this.nameIndex.get(filters.name.toLowerCase());
            resultIds = id ? new Set([id]) : new Set();
        }
        // Search by title (partial match)
        if (filters.title) {
            const titleResults = this.searchInSetIndex(this.titleIndex, filters.title.toLowerCase());
            resultIds = this.intersectSets(resultIds, titleResults);
        }
        // Search by type
        if (filters.type) {
            const typeResults = this.typeIndex.get(filters.type) || new Set();
            resultIds = this.intersectSets(resultIds, typeResults);
        }
        // Search by argument
        if (filters.hasArgument) {
            const argResults = this.argumentIndex.get(filters.hasArgument.toLowerCase()) || new Set();
            resultIds = this.intersectSets(resultIds, argResults);
        }
        // Search by dependency
        if (filters.dependency) {
            const depResults = this.dependencyIndex.get(filters.dependency.toLowerCase()) || new Set();
            resultIds = this.intersectSets(resultIds, depResults);
        }
        // Search by cadence content
        if (filters.cadenceContains) {
            const cadenceResults = this.searchFullText(filters.cadenceContains);
            resultIds = this.intersectSets(resultIds, cadenceResults);
        }
        // Return templates
        const finalIds = resultIds || new Set(this.idIndex.keys());
        return Array.from(finalIds)
            .map(id => this.idIndex.get(id)?.template)
            .filter(template => template !== undefined);
    }
    /**
     * Get template by ID
     */
    getById(id) {
        return this.idIndex.get(id)?.template || null;
    }
    /**
     * Get template by name
     */
    getByName(name) {
        const id = this.nameIndex.get(name.toLowerCase());
        return id ? this.getById(id) : null;
    }
    /**
     * Get all names for a template ID
     */
    getNamesForId(id) {
        const indexed = this.idIndex.get(id);
        return indexed ? Array.from(indexed.names) : [];
    }
    /**
     * Get statistics about the index
     */
    getStats() {
        return {
            totalTemplates: this.idIndex.size,
            totalNames: this.nameIndex.size,
            uniqueTitles: this.titleIndex.size,
            uniqueTypes: this.typeIndex.size,
            uniqueArguments: this.argumentIndex.size,
            uniqueDependencies: this.dependencyIndex.size,
            fullTextTerms: this.fullTextIndex.size
        };
    }
    /**
     * Extract indexable fields from a template
     */
    extractIndexableFields(template) {
        const data = template.data || {};
        const messages = data.messages || {};
        const title = messages.title?.i18n?.['en-US'] || '';
        const description = messages.description?.i18n?.['en-US'] || '';
        // Extract argument names and types
        const argumentNames = Object.keys(data.arguments || {});
        const argumentTypes = Object.values(data.arguments || {}).map((arg) => arg.type || '');
        // Extract dependency contract names
        const dependencies = Object.values(data.dependencies || {})
            .flatMap((dep) => dep ? Object.keys(dep) : []);
        return {
            id: template.id,
            template,
            title,
            description,
            type: data.type || '',
            cadence: data.cadence || '',
            arguments: argumentNames,
            argumentTypes,
            dependencies,
            names: new Set()
        };
    }
    /**
     * Add full-text indexing for searchable content
     */
    indexFullText(indexed) {
        const content = [
            indexed.title,
            indexed.description,
            indexed.cadence,
            ...indexed.arguments,
            ...indexed.dependencies
        ].join(' ').toLowerCase();
        // Simple word tokenization
        const words = content.match(/\w+/g) || [];
        words.forEach(word => {
            if (word.length > 2) { // Skip very short words
                this.addToSetIndex(this.fullTextIndex, word, indexed.id);
            }
        });
    }
    /**
     * Helper: Add to a set-based index
     */
    addToSetIndex(index, key, value) {
        if (!index.has(key)) {
            index.set(key, new Set());
        }
        index.get(key).add(value);
    }
    /**
     * Helper: Search in a set-based index with partial matching
     */
    searchInSetIndex(index, query) {
        const results = new Set();
        for (const [key, ids] of index.entries()) {
            if (key.includes(query)) {
                ids.forEach(id => results.add(id));
            }
        }
        return results;
    }
    /**
     * Helper: Search full-text index
     */
    searchFullText(query) {
        const words = query.toLowerCase().match(/\w+/g) || [];
        let results = null;
        for (const word of words) {
            const wordResults = this.fullTextIndex.get(word) || new Set();
            results = this.intersectSets(results, wordResults);
        }
        return results || new Set();
    }
    /**
     * Helper: Intersect two sets (null means "all")
     */
    intersectSets(set1, set2) {
        if (set1 === null)
            return set2;
        const result = new Set();
        for (const item of set1) {
            if (set2.has(item)) {
                result.add(item);
            }
        }
        return result;
    }
}
exports.TemplateIndexService = TemplateIndexService;
