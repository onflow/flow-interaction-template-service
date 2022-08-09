import express, { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { AuditService } from "../services/audit";

function auditRouter(auditService: AuditService): Router {
  const router = express.Router();

  router.get("/audits", async (req: Request, res: Response) => {
    const templateId = req.query.template_id as string;
    const signerAddress = req.query.signer_address as string;
    const signerNetwork = req.query.signer_network as string;

    if (!templateId) {
      res.status(400);
      return res.send("GET /audits -- 'template_id' query param not found");
    }

    if (!signerNetwork) {
      res.status(400);
      return res.send(
        "GET /audits -- 'signer_network' query param not found ('mainnet' | 'testnet')"
      );
    }

    if (!signerAddress) {
      let audits;
      try {
        audits = await auditService.getAuditsByTemplateID(
          templateId,
          signerNetwork
        );
      } catch (e) {
        res.status(500);
        return res.send(
          `GET /audits -- Error getting audits for template_id=${templateId} signer_network=${signerNetwork}`
        );
      }

      if (!audits) {
        res.status(204);
        return res.send(
          `GET /audits -- Did not find audits for template_id=${templateId} signer_network=${signerNetwork}`
        );
      }

      return res.send(audits);
    } else {
      let audit;
      try {
        audit = await auditService.getAuditBySignerAddress(
          templateId,
          signerAddress,
          signerNetwork
        );
      } catch (e) {
        res.status(500);
        return res.send(
          `GET /audits -- Error getting audit for template_id=${templateId} signer_address=${signerAddress} signer_network=${signerNetwork}`
        );
      }

      if (!audit) {
        res.status(204);
        return res.send(
          `GET /audits -- Did not find audit for template_id=${templateId} signer_address=${signerAddress} signer_network=${signerNetwork}`
        );
      }

      return res.send(audit);
    }
  });

  router.get("/audits/:audit_id", async (req: Request, res: Response) => {
    const auditId = req.params.audit_id;

    let audit;
    try {
      audit = await auditService.getAuditByAuditID(auditId);
    } catch (e) {
      res.status(500);
      return res.send(
        `GET /audits -- Error getting audit for audit_id=${auditId}`
      );
    }

    if (!audit) {
      res.status(204);
      return res.send(
        `GET /audits -- Did not find audit for audit_id=${auditId}`
      );
    }

    return res.send(audit);
  });

  return router;
}

export default auditRouter;
