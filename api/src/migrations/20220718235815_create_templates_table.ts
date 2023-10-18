import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("templates");
  await knex.schema.createTable("templates", async (table) => {
    table.string("id").primary();
    table.json("json_string");
    table.text("mainnet_cadence_ast_sha3_256_hash");
    table.text("testnet_cadence_ast_sha3_256_hash");
    table.text("messages_title_enUS");
    table.text("messages_description_enUS");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("templates");
}
