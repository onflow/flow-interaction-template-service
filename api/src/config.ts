const defaultPort = 3000
const defaultMigrationPath = "./src/migrations"

export function getConfig(env) {
  env = env ?? process.env

  const port = env.PORT || defaultPort

  const accessApi = env.FLOW_ACCESS_API_URL

  const dbPath = env.DATABASE_PATH!
  const databaseUrl = env.DATABASE_URL  

  const databaseMigrationPath =
    env.MIGRATION_PATH || defaultMigrationPath

  const auditDir = env.AUDIT_DIR
  const templateDir = env.TEMPLATE_DIR

  const revokedJsonFile = env.REVOKED_FILE

  console.log("ENV: ", env)
  console.log("accessApi", accessApi)
  console.log("revokedJsonFile: ", revokedJsonFile)
  console.log("databaseMigrationPath: ", databaseMigrationPath)

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
