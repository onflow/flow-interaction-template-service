import { Audit } from "../models/audit";
import { readFiles } from "../utils/read-files";

class AuditService {
  config: any;

  constructor(config: any) {
    this.config = config;
  }

  async insertAudit(audit: string) {
    let newAudit: Audit;

    let auditJSON = JSON.parse(audit);

    newAudit = await Audit.query().insertAndFetch({
      id: auditJSON.id,
      template_id: auditJSON.data.id,
      signer_address: auditJSON.data.signer.address,
      signer_network: auditJSON.data.signer.network,
      json_string: auditJSON,
    });

    return newAudit;
  }

  async getAuditByAuditID(auditId: string) {
    let foundAudit: Audit;

    foundAudit = (
      await Audit.query().where({
        id: auditId,
      })
    )[0];

    return foundAudit ? JSON.parse(foundAudit.json_string) : null;
  }

  async getAuditBySignerAddress(templateId: string, signerAddress: string, signerNetwork: string) {
    let foundAudit: Audit;

    foundAudit = (
      await Audit.query().where({
        template_id: templateId,
        signer_address: signerAddress,
        signer_network: signerNetwork
      })
    )[0];

    return foundAudit ? JSON.parse(foundAudit.json_string) : null;
  }

  async getAuditsByTemplateID(templateId: string, signerNetwork: string) {
    let foundAudits: Audit[];

    foundAudits = await Audit.query().where({
      template_id: templateId,
      signer_network: signerNetwork
    });

    return foundAudits
      ? foundAudits.map((foundAudit) => JSON.parse(foundAudit.json_string))
      : null;
  }

  async seed() {
    const audits = await readFiles(this.config.auditDir + "/*.json");

    await Audit.query().del();

    for (let audit of audits) {
      let parsedAudit = JSON.parse(audit.content);

      await Audit.query().insertAndFetch({
        id: parsedAudit.id,
        template_id: parsedAudit.data.id,
        signer_address: parsedAudit.data.signer.address,
        signer_network: parsedAudit.data.signer.network,
        json_string: audit.content,
      });
    }
  }
}

export { AuditService };
