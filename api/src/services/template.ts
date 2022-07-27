import { Template } from "../models/template";
import {readFiles} from "../utils/read-files"

 class TemplateService {
  config: any;
 
  constructor(config: any) {
    this.config = config;
  }
 
  async insertTemplate(
     template: string,
   ) {
     let newTemplate: Template;

     let templateJSON = JSON.parse(template)
 
     newTemplate = await Template.query().insertAndFetch({
        id: templateJSON.id,
        json_string: template,
     });
     
     return newTemplate;
   }

  async getTemplate(
    templateId: string,
  ) {
    let foundTemplate: Template;

    foundTemplate = (await Template.query().where({
       id: templateId,
    }))[0];

    let foundTemplateJson = foundTemplate?.json_string || null

    if (typeof foundTemplateJson === "string") {
      foundTemplateJson = JSON.parse(foundTemplateJson)
    } 

    return foundTemplateJson;
  }

  async seed() {
    const templates = await readFiles(this.config.templateDir + "/*.json")

    await Template.query().del()
    
    for (let template of templates) {
      let parsedTemplate = JSON.parse(template.content)
      await Template.query().insertAndFetch({
        id: parsedTemplate.id,
        json_string: template.content,
     })
    }
  }
 
}
 
 export { TemplateService };
 