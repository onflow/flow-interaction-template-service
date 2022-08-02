import { BaseModel } from "./base";

class Template extends BaseModel {
  id!: string;
  json_string!: string;
  testnet_cadence!: string;
  mainnet_cadence!: string;

  static get tableName() {
    return "templates";
  }
}

export { Template };
