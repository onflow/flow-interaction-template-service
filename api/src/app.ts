import {json, urlencoded} from "body-parser"
import cors from "cors"
import express, {Request, Response} from "express"
import "express-async-errors"
import path from "path"

import auditRouter from "./routes/audit"
import templateRouter from "./routes/template"
import revocationRouter from "./routes/revocation"

import {AuditService} from "./services/audit"
import {TemplateService} from "./services/template"
import {RevocationService} from "./services/revocation"

const V1 = "/v1/"

// Init all routes, setup middlewares and dependencies
const initApp = (
  auditService: AuditService,
  templateService: TemplateService,
  revocationService: RevocationService
) => {
  const app = express()

  app.use(cors())
  app.use(json())
  app.use(urlencoded({extended: false}))
  app.use(V1, auditRouter(auditService))
  app.use(V1, templateRouter(templateService))
  app.use(V1, revocationRouter(revocationService))

  app.all("*", async (req: Request, res: Response) => {
    return res.sendStatus(404)
  })

  return app
}

export default initApp
