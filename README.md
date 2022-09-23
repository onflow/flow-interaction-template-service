# 🌊 Flow Interaction Template Service

This Flow Interaction Template Service provides a way to propose, store and host `InteractionTemplate` data structures.

## 📖 Overview

This repository is a place for developers to propose their Interaction Templates to be audited, and where Interaction Templates can be stored and hosted by the provided API.

## 💡 Propose Interaction Template

If you have created an Interaction Template, you can create a PR to palce your Interaction Template into the `./proposals` folder of this repository.

Auditors in the Flow ecosystem can check this folder to see new Interaction Templates available for audit.

## 💾 Store Interaction Templates

If you have created an Interaction Template, you can create a PR to place your Interaction Template in the `./templates` folder of this repository.

## 📤 Host Interaction Templates

The `./api` folder of this repository contains an API which can be run, and makes available the Interaction Templates stored in the `./templates` folder in a queryable way.

With the API you can query Interaction Template by their ID:

```
GET /v1/templates/${template_id}
  => InteractionTemplate
```

You can also query for Interaction Template by their cadence body:

```
POST /v1/templates/search
  body (JSON): {
    cadence_base64: "...",
    network: "..." (mainnet | testnet)
  }
  => InteractionTemplate
```

You can query for known Auditor information for a given network:

```
GET /v1/auditors?network=(mainnet | testnet)
  => [FlowInteractionTemplateAuditor]

  // Flow Interaction Template Auditor
  // {
  //   f_type: "FlowInteractionTemplateAuditor"
  //   f_version: "1.0.0"
  //   address: string
  //   name: string
  //   website_url?: string
  //   twitter_url?: string
  // }
```

Interaction Template can be hosted under a static identifer (name), allowing the underlying Interaction Template to change while the way to query for it remained constant:

```
GET /v1/templates?name=transfer-flow
  => InteractionTemplate
```

Flow's Interaction Template service is available at:

```
https://flix.flow.com

eg: GET https://flix.flow.com/v1/templates/${template_id}
eg: POST https://flix.flow.com/v1/templates/search
    body (JSON): {
      cadence_base64: "...",
      network: "..." (mainnet | testnet)
    }
```
