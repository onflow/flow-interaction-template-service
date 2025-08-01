#!/usr/bin/env node

const { glob } = require("glob");
const fs = require("fs");
const path = require("path");

console.log("Building templates for Vercel deployment...");

async function buildTemplates() {
  try {
    // Find all template files
    const templateFiles = await glob("templates/**/*.json", { 
      cwd: process.cwd(),
      ignore: ["templates/NFTCatalog/catalog-manifest.json"] // Skip the large manifest
    });
    
    console.log(`Found ${templateFiles.length} template files`);
    
    const templates = [];
    const templateManifest = {};
    
    // Process each template file
    for (const filePath of templateFiles) {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const template = JSON.parse(content);
        
        // Only process InteractionTemplate v1.0.0
        if (template.f_type === "InteractionTemplate" && template.f_version === "1.0.0") {
          templates.push(template);
          templateManifest[template.id] = template;
          
          if (templates.length % 50 === 0) {
            console.log(`Processed ${templates.length} templates...`);
          }
        }
      } catch (e) {
        console.warn(`Skipping ${filePath}: ${e.message}`);
      }
    }
    
    console.log(`Successfully processed ${templates.length} templates`);
    
    // Ensure dist directory exists
    const distDir = path.join(process.cwd(), "dist");
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Write the pre-built templates file
    const templatesPath = path.join(distDir, "templates.json");
    fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2));
    console.log(`Wrote templates to ${templatesPath}`);
    
    // Write the manifest file
    const manifestPath = path.join(distDir, "template-manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(templateManifest, null, 2));
    console.log(`Wrote manifest to ${manifestPath}`);
    
    // Copy names.json and auditors.json to dist for Vercel
    try {
      const namesPath = path.join(process.cwd(), "names/names.json");
      const auditorsPath = path.join(process.cwd(), "auditors/auditors.json");
      
      if (fs.existsSync(namesPath)) {
        fs.copyFileSync(namesPath, path.join(distDir, "names.json"));
        console.log("Copied names.json to dist/");
      }
      
      if (fs.existsSync(auditorsPath)) {
        fs.copyFileSync(auditorsPath, path.join(distDir, "auditors.json"));
        console.log("Copied auditors.json to dist/");
      }
    } catch (e) {
      console.warn("Warning: Could not copy config files:", e.message);
    }
    
    console.log("✅ Template build complete!");
    
  } catch (error) {
    console.error("❌ Template build failed:", error);
    process.exit(1);
  }
}

buildTemplates();