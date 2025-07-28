# Flow Templates Service - Deployment Guide

This guide explains how to deploy the Flow Templates Service to Vercel after the recent updates.

## What Was Fixed

The application has been updated to resolve the `crypto.randomUUID is not a function` error and other compatibility issues:

1. **Node.js Version**: Updated to Node.js 20.x LTS (latest stable LTS version)
2. **FCL Upgrade**: Updated @onflow/fcl from 1.1.1-templates.8 to 1.20.0 (latest version)
3. **Crypto Polyfill**: Added crypto.randomUUID polyfill for complete compatibility
4. **Dependencies**: Updated all dependencies to latest compatible versions
5. **TypeScript**: Updated to TypeScript 5.6.x with ES2023 target
6. **Serverless Compatibility**: Created Vercel-specific serverless entry point
7. **Build Configuration**: Updated build scripts and Vercel configuration

## Prerequisites

- Node.js 20.x LTS or higher
- Vercel CLI (optional, for local testing)

## Environment Variables

The following environment variables need to be set in your Vercel project:

```bash
# Flow Access API URL
FLOW_ACCESS_API_URL=https://rest-mainnet.onflow.org

# Database configuration (uses SQLite in serverless temp directory)
DATABASE_PATH=/tmp/flow-templates-db.sqlite
DATABASE_URL=sqlite:/tmp/flow-templates-db.sqlite

# File paths
AUDITORS_JSON_FILE=./auditors/auditors.json
NAMES_JSON_FILE=./names/names.json
TEMPLATE_DIR=./templates

# FCL Configuration (latest version 1.20.0)
FLOW_NETWORK=mainnet
DISCOVERY_WALLET=https://fcl-discovery.onflow.org/mainnet/authn

# Optional: For analytics
MIXPANEL_TOKEN=your_mixpanel_token_here
```

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Connect your GitHub repository
4. Set the environment variables in the Vercel project settings
5. Deploy

### 4. Set Environment Variables in Vercel

In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add all the required environment variables listed above

## Local Development

For local development:

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update the values in `.env.local`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run in development mode:
   ```bash
   cd api && npm run dev
   ```

## File Structure

```
├── api/                    # Backend API
│   ├── src/               # Source code
│   ├── vercel.ts          # Vercel serverless entry point
│   └── package.json       # API dependencies
├── templates/             # Flow transaction templates
├── auditors/              # Auditor configuration
├── names/                 # Name mappings
├── vercel.json           # Vercel deployment configuration
└── package.json          # Root package configuration
```

## Troubleshooting

### Common Issues

1. **crypto.randomUUID is not a function**
   - Fixed by updating to Node.js 20.x LTS in `vercel.json`
   - Added crypto.randomUUID polyfill for complete compatibility
   - Upgraded @onflow/fcl from 1.1.1-templates.8 to 1.20.0

2. **Database connection issues**
   - The app now uses SQLite in serverless temp directory
   - Database is recreated on each cold start (expected behavior)

3. **Missing templates/files**
   - Ensure all template files are included in the deployment
   - Check `vercel.json` includeFiles configuration

### Logs

Check Vercel function logs in the Vercel dashboard under:
- Project → Functions → View Function Logs

## API Endpoints

After deployment, your API will be available at:

- `GET /v1/templates/{templateId}` - Get a specific template
- `GET /v1/auditors` - Get auditor information
- Additional endpoints as defined in the routes

## Performance Notes

- The application uses SQLite which is recreated on each serverless function cold start
- Template seeding happens on initialization
- Consider implementing caching for better performance if needed 