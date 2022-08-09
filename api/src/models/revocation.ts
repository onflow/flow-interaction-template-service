import { BaseModel } from "./base";

class Revocation extends BaseModel {
  id!: string;

  static get tableName() {
    return "revocations";
  }
}

export { Revocation };
