import express, {Request, Response, Router} from "express"
 import {body} from "express-validator"
 import {validateRequest} from "../middlewares/validate-request"
 import {TemplateService} from "../services/template"
 
 function templateRouter(templateService: TemplateService): Router {
   const router = express.Router()
 
   router.get(
     "/template/:template_id",
     async (req: Request, res: Response) => {
       const templateId = req.params.template_id;
       
       const template = await templateService.getTemplate(
        templateId
       )

       if (!template) return res.sendStatus(204)

       return res.send(
        template
       )
     }
   )

   router.get(
    "/template",
    async (req: Request, res: Response) => {
      const base64EncodedCadence = req.query.cadence as string
      const network = req.query.network as string
      
      let cadence = base64EncodedCadence.replace(/ /ig, "+") // "+" are replaced with " " from query param, this reverts this

      const template = await templateService.getTemplateByCadence(
        cadence,
        network
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
 