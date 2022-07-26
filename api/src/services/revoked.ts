import { Revoked } from "../models/revoked";
import {readFiles} from "../utils/read-files"

 class RevokedService {
    config: any;

    constructor(config: any) {
        this.config = config;
    }

  async insertRevoked(
    auditId: string,
   ) {
     let newRevoked: Revoked;
 
     newRevoked = await Revoked.query().insertAndFetch({
        id: auditId
     });
     
     return newRevoked;
   }

  async getRevoked(
    auditId: string,
  ) {
    let foundRevoked: Revoked;

    foundRevoked = (await Revoked.query().where({
       id: auditId,
    }))[0];
    
    return foundRevoked ? true : false;
  }

  async seed () {
    const revokedFile = (await readFiles(this.config.revokedJsonFile))[0]

    await Revoked.query().del()

    let parsedRevoked = JSON.parse(revokedFile.content)

    await Promise.all(Object.keys(parsedRevoked).map(async auditId => {
        console.log("Revoked Seed, inserting: id=", auditId)
        await Revoked.query().insertAndFetch({
            id: auditId,
        })
    }))
  }
 
}
 
 export { RevokedService };
 