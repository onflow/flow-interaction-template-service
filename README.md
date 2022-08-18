# 🌊 Flow Interaction Template Service

This Flow Interaction Template Service provides a way to propose, store and host `InteractionTemplate` data structures.

## 📖 Overview

This repository is a place to developers to propose their Interaction Templates to be audited, and where Interaction Tempaltes can be stored and hosted by the provided API.

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
  => Interaction Template
```

You can also query for Interaction Template by their cadence body:

```
GET /v1/templates?cadence={base_64_encoded_cadence}&network={'mainnet' | 'testnet'}
  => Interaction Template
```
