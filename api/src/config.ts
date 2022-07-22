const defaultPort = 3000
const defaultMigrationPath = "./src/migrations"

export function getConfig(env) {
  env = env ?? process.env

  const port = env.PORT || defaultPort

  const accessApi = env.FLOW_ACCESS_API_URL

  const dbPath = env.DATABASE_PATH!
  const databaseUrl = env.DATABASE_URL  

  const databaseMigrationPath =
    process.env.MIGRATION_PATH || defaultMigrationPath

  const auditDir = process.env.AUDIT_DIR
  const templateDir = process.env.TEMPLATE_DIR

  const revokedJsonFile = process.env.REVOKED_FILE

  return {
    port,
    accessApi,
    dbPath,
    databaseMigrationPath,
    databaseUrl,
    auditDir,
    templateDir,
    revokedJsonFile
  }
}
