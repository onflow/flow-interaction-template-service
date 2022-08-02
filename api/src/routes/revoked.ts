import express, {Request, Response, Router} from "express"
 import {body} from "express-validator"
 import {validateRequest} from "../middlewares/validate-request"
 import {RevokedService} from "../services/revoked"
 
 function revokedRouter(revokedService: RevokedService): Router {
   const router = express.Router()

   router.get(
     "/revoked",
     async (req: Request, res: Response) => {
       const auditId = req.query.audit_id as string
       
       const revoked = await revokedService.getRevoked(
        auditId
       )
       return res.send({
        revoked
       })
     }
   )
 
   return router
 }
 
 export default revokedRouter
 