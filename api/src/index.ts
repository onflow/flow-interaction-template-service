import * as fcl from "@onflow/fcl"
import fs from "fs"
import {hideBin} from "yargs/helpers"
import yargs from "yargs/yargs"
import initApp from "./app"
import {getConfig} from "./config"
import initDB from "./db"
import {AuditService} from "./services/audit"
import {TemplateService} from "./services/template"
import {RevocationService} from "./services/revocation"

const argv = yargs(hideBin(process.argv)).argv
const DEV = argv.dev

let envVars

if (DEV) {
  const env = require("dotenv")
  const expandEnv = require("dotenv-expand")

  const config = env.config({
    path: process.cwd() + "/.env.local",
  })

  expandEnv(config)
  console.log("CONFIG", config)
  envVars = config.parsed
}

async function run() {
  const config = getConfig(envVars)
  const db = initDB(config)

  // Make sure to disconnect from DB when exiting the process
  process.on("SIGTERM", () => {
    db.destroy().then(() => {
      process.exit(0)
    })
  })

  try {
    fs.unlinkSync(config.dbPath);
  } catch (e) {}

  // Run all database migrations
  await db.migrate.latest()

  // Make sure we're pointing to the correct Flow Access API.
  fcl
    .config()
    .put("accessNode.api", config.accessApi)

  const startAPIServer = async () => {
    console.log("Starting API server ....")
    const templateService = new TemplateService(config)
    const auditService = new AuditService(config)
    const revocationService = new RevocationService(config)

    console.log("...Seeding TemplateService...")
    await templateService.seed()
    console.log("Seeded TemplateService!")
    console.log("...Seeding AuditService...")
    await auditService.seed()
    console.log("Seeded AuditService!")
    console.log("...Seeding RevokedService...")
    await revocationService.seed()
    console.log("Seeded RevokedService!")

    const app = initApp( auditService, templateService, revocationService )

    app.listen(config.port, () => {
      console.log(`Listening on port ${config.port}!`)
    })
  }

  await startAPIServer()
}

const redOutput = "\x1b[31m%s\x1b[0m"

run().catch(e => {
  console.error(redOutput, e)
  process.exit(1)
})
