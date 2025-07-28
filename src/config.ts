const defaultPort = 3000;
const defaultAccessApi = "https://rest-mainnet.onflow.org";
const defaultTemplateDir = "../templates/**/*.json";
const defaultAuditorsJsonFile = "../auditors/auditors.json";
const defaultNamesJsonFile = "../names/names.json";
const defaultTemplateManifestFile = "../templates/NFTCatalog/catalog-manifest.json";
const defaultAllowedOrigins = "*"; // Default to allow all origins

export function getConfig(env) {
  env = env ?? process.env;

  const port = env.PORT || defaultPort;
  const accessApi = env.FLOW_ACCESS_API_URL || defaultAccessApi;
  const auditorsJsonFile = env.AUDITORS_JSON_FILE || defaultAuditorsJsonFile;
  const namesJsonFile = env.NAMES_JSON_FILE || defaultNamesJsonFile;
  const templateDir = env.TEMPLATE_DIR || defaultTemplateDir;
  const peers = env.PEERS;
  const templateManifestFile = env.TEMPLATE_MANIFEST_FILE || defaultTemplateManifestFile;

  // CORS configuration
  const allowedOrigins = env.ALLOWED_ORIGINS || defaultAllowedOrigins;
  const allowCredentials = env.ALLOW_CREDENTIALS === "true" || true;

  console.log("ENV: ", env);
  console.log("accessApi", accessApi);
  console.log("allowedOrigins: ", allowedOrigins);

  return {
    port,
    accessApi,
    templateDir,
    auditorsJsonFile,
    namesJsonFile,
    peers,
    templateManifestFile,
    allowedOrigins,
    allowCredentials,
  };
}
