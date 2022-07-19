import { BaseModel } from "./base";

class Audit extends BaseModel {
  id!: string;
  json_string!: string;

  static get tableName() {
    return "audits";
  }
}

export { Audit };
