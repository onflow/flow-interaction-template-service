import { BaseModel } from "./base";

class Template extends BaseModel {
  id!: string;
  json_string!: string;

  static get tableName() {
    return "templates";
  }
}

export { Template };
