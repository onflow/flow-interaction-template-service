# Template Indexing System

This document describes the new multi-dimensional template indexing system that allows for flexible template discovery and search.

## Features

### 1. **Multiple Names per Template**
- Different names can map to the same template ID
- Example: Both "transfer-flow" and "transfer-tokens" can reference the same template
- Supports name aliases and backwards compatibility

### 2. **Multi-Dimensional Indexing**
Templates are indexed by:
- **Name**: Multiple names/aliases
- **ID**: Unique template identifier
- **Title**: Human-readable title
- **Description**: Full description text
- **Type**: `transaction` or `script`
- **Arguments**: Parameter names and types
- **Dependencies**: Contract dependencies
- **Cadence Code**: Full-text search in code

### 3. **Advanced Search Capabilities**
- Combine multiple search criteria
- Partial text matching
- Full-text search in code
- Filter by template properties

## API Endpoints

### Search Templates
```http
GET /v1/templates/search?param=value
```

**Query Parameters:**
- `name` - Exact name match
- `title` - Partial title match
- `description` - Search in description
- `type` - Filter by transaction/script
- `hasArgument` - Templates with specific argument
- `argumentType` - Filter by argument type
- `dependency` - Filter by contract dependency
- `cadenceContains` - Full-text search in Cadence code

**Example:**
```http
GET /v1/templates/search?type=transaction&hasArgument=amount&dependency=FungibleToken
```

### Get Template by Name (Enhanced)
```http
GET /v1/templates?name=transfer-flow
```
Now uses the indexing system with fallback to legacy names.json

### Get Template Names
```http
GET /v1/templates/{template_id}/names
```
Returns all names/aliases for a specific template.

### Get Index Statistics
```http
GET /v1/templates/stats
```
Returns indexing statistics and health information.

## Example Usage

### Finding Flow Transfer Templates
```bash
# By name
curl "/v1/templates?name=transfer-flow"

# By partial title search
curl "/v1/templates/search?title=transfer"

# By arguments
curl "/v1/templates/search?hasArgument=amount&hasArgument=to"

# By dependency
curl "/v1/templates/search?dependency=FlowToken"

# Full-text search in code
curl "/v1/templates/search?cadenceContains=withdraw"
```

### Multiple Names Example
```bash
# Both return the same template
curl "/v1/templates?name=transfer-flow"
curl "/v1/templates?name=transfer-tokens"

# Get all names for a template
curl "/v1/templates/4431a123049f8046a69c779672fcdd342b870371601040d4eb572158f5e6ee97/names"
```

## Implementation Details

### IndexedTemplate Structure
```typescript
interface IndexedTemplate {
  id: string;
  template: any;
  title: string;
  description: string;
  type: string;
  cadence: string;
  arguments: string[];
  argumentTypes: string[];
  dependencies: string[];
  names: Set<string>;
}
```

### Index Types
- **idIndex**: Map<string, IndexedTemplate> - Primary template storage
- **nameIndex**: Map<string, string> - Name to ID mapping
- **titleIndex**: Map<string, Set<string>> - Title search
- **typeIndex**: Map<string, Set<string>> - Type filtering
- **argumentIndex**: Map<string, Set<string>> - Argument search
- **dependencyIndex**: Map<string, Set<string>> - Dependency search
- **fullTextIndex**: Map<string, Set<string>> - Full-text search

### Loading Process
1. Templates are loaded from `templates/**/*.json`
2. Each template is indexed across all dimensions
3. Names from `names.json` are loaded as aliases
4. Index statistics are logged

## Backwards Compatibility

The system maintains full backwards compatibility:
- Original `/v1/templates?name=X` endpoint works as before
- Falls back to legacy names.json if name not found in index
- All existing functionality preserved
- Enhanced with new search capabilities

## Performance

- **Memory Usage**: Additional indexing structures use ~10-20% more memory
- **Search Speed**: O(1) for exact matches, O(n) for partial matches
- **Indexing Time**: ~1-2ms per template during startup
- **Full-Text Search**: Simple word-based matching (can be enhanced)

## Future Enhancements

1. **Fuzzy Search**: Typo-tolerant name matching
2. **Semantic Search**: Understanding of template purpose
3. **Usage Analytics**: Popular template tracking
4. **Dynamic Reloading**: Hot-reload of template changes
5. **Advanced Full-Text**: Better tokenization and ranking