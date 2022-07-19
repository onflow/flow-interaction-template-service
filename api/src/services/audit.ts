import { Audit } from "../models/audit";
import {readFiles} from "../utils/read-files"

 class AuditService {
  config: any;
 
  constructor(config: any) {
    this.config = config;
  }
 
  async insertAudit(
     audit: string,
   ) {
     let newAudit: Audit;

     let auditJSON = JSON.parse(audit)
 
     newAudit = await Audit.query().insertAndFetch({
        id: auditJSON.id,
        json_string: audit,
     });
     
     return newAudit;
   }

  async getAudit(
    auditId: string,
  ) {
    let foundAudit: Audit;

    foundAudit = (await Audit.query().where({
       id: auditId,
    }))[0];
    
    return foundAudit ? JSON.parse(foundAudit.json_string) : null;
  }

  async seed() {
    const audits = await readFiles(this.config.auditDir + "/*.json")

    for (let audit of audits) {
      let parsedAudit = JSON.parse(audit.content)

      await Audit.query().insertAndFetch({
        id: parsedAudit.data.id,
        json_string: audit.content,
     })
    }
  }
 
}
 
 export { AuditService };
 