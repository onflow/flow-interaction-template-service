import { BaseModel } from "./base";

class Revoked extends BaseModel {
  id!: string;

  static get tableName() {
    return "revoked";
  }
}

export { Revoked };
