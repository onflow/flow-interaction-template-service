# Flow Interaction Template Service

This Flow Interaction Template Service provides a way to propose, store and host `InteractionTemplate` data structures using an efficient in-memory storage system.

## Overview

This repository is a place for developers to propose their Interaction Templates to be audited, and where Interaction Templates can be stored and hosted by the provided API. The service uses an in-memory storage system that loads all templates at startup for fast, efficient access.

## Architecture

### In-Memory Storage System
The service uses a high-performance in-memory storage system that:
- Loads templates at startup from the `./templates` directory
- Stores templates in hash maps for O(1) lookup performance  
- Supports 580+ templates with only ~12MB memory usage
- Eliminates database dependencies for simplified deployment
- Optimized for serverless environments like Vercel

### Template Loading
Templates are automatically loaded from:
- Local template files in `./templates/**/*.json`
- Remote peer instances (if configured via `PEERS` environment variable)
- Existing manifest files for backward compatibility

### API Endpoints
The service provides a RESTful API with the following endpoints:

#### Template Operations
- `GET /v1/templates/{template_id}` - Get template by ID
- `GET /v1/templates?name={name}` - Get template by name alias  
- `GET /v1/templates/manifest` - Get complete template manifest
- `POST /v1/templates/search` - Search templates by Cadence AST hash

#### Auditor Operations  
- `GET /v1/auditors?network={network}` - Get auditors for network (mainnet/testnet)

#### Documentation
- `GET /` - Interactive API documentation homepage

<a name="propose"></a>

## Propose Interaction Template

If you have created an Interaction Template, you can create a PR to place your Interaction Template in the `./proposals` folder of this repository.

Auditors in the Flow ecosystem can check this folder to see new Interaction Templates available for audit.

## Store Interaction Templates

If you have created an Interaction Template, you can create a PR to place your Interaction Template in the `./templates` folder of this repository. Templates are automatically loaded into memory when the service starts.

## Host Interaction Templates

### Query by Template ID
```http
GET /v1/templates/${template_id}
```
Returns the complete InteractionTemplate JSON object.

### Search by Cadence Code
```http
POST /v1/templates/search
Content-Type: application/json

{
  "cadence_base64": "base64-encoded-cadence-code",
  "network": "mainnet" | "testnet"
}
```
Returns the InteractionTemplate that matches the provided Cadence AST hash.

### Query by Name Alias
```http
GET /v1/templates?name=transfer-flow
```
Returns the InteractionTemplate associated with the given name alias.

### Get Template Manifest
```http
GET /v1/templates/manifest
```
Returns the complete manifest of all available templates.

### Get Auditors
```http
GET /v1/auditors?network=mainnet
```
Returns auditor information for the specified network.

## Deployment

### Vercel
The service is optimized for serverless deployment on Vercel:

1. No database setup required - templates are loaded from the filesystem
2. Fast cold starts - templates load in 1-2 seconds
3. Efficient memory usage - only ~12MB for 580+ templates
4. Simple build process - single TypeScript compilation step

Required environment variables:
```bash
NODE_ENV=production
FLOW_ACCESS_API_URL=https://rest-mainnet.onflow.org
AUDITORS_JSON_FILE=./auditors/auditors.json
NAMES_JSON_FILE=./names/names.json  
TEMPLATE_DIR=./templates
FLOW_NETWORK=mainnet
DISCOVERY_WALLET=https://fcl-discovery.onflow.org/mainnet/authn
```

### Other Platforms
The service can run on any Node.js hosting platform:
```bash
npm install
npm run build
npm start
```

## Development

### Prerequisites
- Node.js 18.x
- npm

### Setup
```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Build production version  
npm run build

# Start production server
npm start
```

### Project Structure
```
├── api/                             # Vercel serverless functions
│   └── index.ts                     # Main serverless function entry point
├── src/                             # Source code
│   ├── storage/                     # In-memory storage system
│   │   └── InMemoryTemplateStorage.ts
│   ├── services/                    # Business logic layer
│   │   └── template.ts
│   ├── routes/                      # API route definitions
│   │   ├── template.ts              # Template endpoints
│   │   └── auditors.ts              # Auditor endpoints  
│   ├── middlewares/                 # Express middleware
│   │   └── cors.ts
│   ├── utils/                       # Utility functions
│   │   ├── crypto-polyfill.ts
│   │   ├── gen-hash.ts
│   │   ├── mixpanel.ts
│   │   ├── parse-cadence.ts
│   │   ├── read-files.ts
│   │   └── write-file.ts
│   ├── app.ts                       # Express app configuration
│   ├── index.ts                     # Development server entry
│   └── config.ts                    # Configuration management
├── templates/                       # Template storage directory
│   ├── NFTCatalog/                  # NFT catalog templates
│   │   └── catalog-manifest.json    # Template catalog manifest
│   ├── FlowCore/                    # Core Flow templates  
│   ├── EmeraldID/                   # EmeraldID templates
│   ├── test/                        # Test templates
│   └── *.template.json              # Individual template files
├── auditors/                        # Auditor configuration
│   └── auditors.json                # Network-specific auditor information
├── names/                           # Name alias mappings
│   └── names.json                   # Template name aliases
├── proposals/                       # Proposed templates for review
├── vercel.json                      # Vercel deployment configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── .nvmrc                          # Node.js version specification
```

### Configuration Files
- **`vercel.json`** - Vercel deployment configuration with serverless function setup
- **`tsconfig.json`** - TypeScript compilation settings
- **`package.json`** - Dependencies and build scripts
- **`auditors/auditors.json`** - Network-specific auditor information
- **`names/names.json`** - Name aliases for template lookup
- **Template files** - Individual `.template.json` files containing InteractionTemplate data

## Live Service

Flow's official Interaction Template service is available at:
```
https://flix.flow.com
```

Example requests:
```bash
# Get template by name
curl "https://flix.flow.com/v1/templates?name=transfer-flow"

# Get template by ID  
curl "https://flix.flow.com/v1/templates/{template_id}"

# Search by Cadence code
curl -X POST "https://flix.flow.com/v1/templates/search" \
  -H "Content-Type: application/json" \
  -d '{"cadence_base64": "...", "network": "mainnet"}'

# Get auditors
curl "https://flix.flow.com/v1/auditors?network=mainnet"
```

## Open to Anyone

This project is open to be run by anyone. By forking this repository and deploying the API service, anyone can run an instance of FLIX and make Interaction Templates available for querying.

If you don't wish to operate your own instance of FLIX, you can use Flow's official instance at `https://flix.flow.com`. To add Interaction Templates to Flow's instance, follow the [Propose Templates](#propose) workflow above.

## Performance Characteristics

- **Startup Time**: 1-2 seconds to load 580+ templates
- **Memory Usage**: ~12MB total (1.2% of typical serverless limits)
- **Lookup Performance**: O(1) hash map lookups
- **Template Count**: Currently supporting 580+ templates
- **Data Size**: ~7.5MB of template data

## Features

- In-memory storage for maximum performance
- Serverless-optimized architecture  
- Zero database dependencies
- Fast cold starts on Vercel
- Template validation using Flow's InteractionTemplateUtils
- Automatic manifest generation
- CORS-enabled for browser usage
- TypeScript for type safety
