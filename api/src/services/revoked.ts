import { Revoked } from "../models/revoked";

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
 
}
 
 export { RevokedService };
 