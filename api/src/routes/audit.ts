 import express, {Request, Response, Router} from "express"
 import {body} from "express-validator"
 import {validateRequest} from "../middlewares/validate-request"
 import {AuditService} from "../services/audit"
 
 function auditRouter(auditService: AuditService): Router {
   const router = express.Router()
 
   router.get(
     "/audit",
     async (req: Request, res: Response) => {
       const templateId = req.query.template_id as string
       
       const audit = await auditService.getAudit(
        templateId
       )

       if (!audit) return res.sendStatus(204)

       return res.send(
        audit
       )
     }
   )
 
   return router
 }
 
 export default auditRouter
 