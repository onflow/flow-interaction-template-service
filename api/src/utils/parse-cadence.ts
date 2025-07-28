import { CadenceParser } from "@onflow/cadence-parser";
import fs from "fs";
import path from "path";

let memoCadenceParser;

function removeASTPosition(obj) {
  for(let prop in obj) {
    if (prop.match(/\w+Pos/g))
      delete obj[prop];
    else if (typeof obj[prop] === 'object')
      removeASTPosition(obj[prop]);
  }
  return obj
}

export async function parseCadence(cadence: string) {
  // For now, skip WASM parsing and just return the code as-is
  // This keeps the service focused on serving templates, not parsing Cadence
  return JSON.stringify({ 
    code: cadence, 
    parsed: false,
    note: "Cadence parsing disabled - serving templates only"
  });
}
