import { BaseModel } from "./base";

class Audit extends BaseModel {
  id!: string;
  template_id!: string;
  signer_network!: string;
  signer_address!: string;
  json_string!: string;

  static get tableName() {
    return "audits";
  }
}

export { Audit };
