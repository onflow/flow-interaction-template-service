import express, { Request, Response, Router } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { RevocationService } from "../services/revocation";

function revocationRouter(revocationService: RevocationService): Router {
  const router = express.Router();

  router.get("/revocations", async (req: Request, res: Response) => {
    const auditId = req.query.audit_id as string;

    if (!auditId) {
      res.status(400);
      return res.send("GET /revocations -- 'audit_id' query param not found");
    }

    let revoked;
    try {
      revoked = await revocationService.getRevocation(auditId);
    } catch (e) {
      res.status(500);
      return res.send(
        `GET /revocations -- Error getting revocation for audit_id=${auditId}`
      );
    }

    if (typeof revoked === "undefined") {
      res.status(204);
      return res.send(
        `GET /revocations -- Did not find revocation entry for audit_id=${auditId}`
      );
    }

    return res.send(revoked);
  });

  return router;
}

export default revocationRouter;
