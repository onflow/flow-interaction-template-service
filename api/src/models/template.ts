import { BaseModel } from "./base";

class Template extends BaseModel {
  id!: string;
  json_string!: string;
  testnet_cadence_ast_sha3_256_hash!: string;
  mainnet_cadence_ast_sha3_256_hash!: string;
  messages_title_enUS?: string;
  messages_description_enUS?: string;

  static get tableName() {
    return "templates";
  }
}

export { Template };
