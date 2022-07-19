import express, {Request, Response, Router} from "express"
 import {body} from "express-validator"
 import {validateRequest} from "../middlewares/validate-request"
 import {TemplateService} from "../services/template"
 
 function templateRouter(templateService: TemplateService): Router {
   const router = express.Router()
 
//    router.post(
//      "/template",
//      validateRequest,
//      async (req: Request, res: Response) => {
//        const template = req.body
//        const newTemplate = await templateService.insertTemplate(JSON.stringify(template))
//        return res.send({
//         template: newTemplate
//        })
//      }
//    )
 
   router.get(
     "/template/:template_id",
     async (req: Request, res: Response) => {
       const templateId = req.params.template_id;

       console.log("route templateId", templateId)
       
       const template = await templateService.getTemplate(
        templateId
       )

       if (!template) return res.sendStatus(204)

       return res.send(
        template
       )
     }
   )
 
   return router
 }
 
 export default templateRouter
 