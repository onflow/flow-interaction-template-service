import { Revocation } from "../models/revocation";
import { readFiles } from "../utils/read-files";

class RevocationService {
  config: any;

  constructor(config: any) {
    this.config = config;
  }

  async insertRevocation(auditId: string) {
    let newRevoked: Revocation;

    newRevoked = await Revocation.query().insertAndFetch({
      id: auditId,
    });

    return newRevoked ? true : false;
  }

  async getRevocation(auditId: string) {
    let foundRevoked: Revocation;

    foundRevoked = (
      await Revocation.query().where({
        id: auditId,
      })
    )[0];

    return foundRevoked ? true : false;
  }

  async seed() {
    const revokedFile = (await readFiles(this.config.revokedJsonFile))[0];

    await Revocation.query().del();

    let parsedRevoked = JSON.parse(revokedFile.content);

    await Promise.all(
      Object.keys(parsedRevoked).map(async (auditId) => {
        console.log("Revoked Seed, inserting: id=", auditId);
        await Revocation.query().insertAndFetch({
          id: auditId,
        });
      })
    );
  }
}

export { RevocationService };
