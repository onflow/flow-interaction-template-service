import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("audits", async (table) => {
    table.string("id").primary();
    table.json("json_string");
    table.string("template_id");
    table.string("signer_address");
    table.string("signer_network");
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("audits");
}
