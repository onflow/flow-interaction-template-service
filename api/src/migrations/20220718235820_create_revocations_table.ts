import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("revocations");
  const hasTable = await knex.schema.hasTable("revocations");
  await knex.schema.createTable("revocations", async (table) => {
    table.string("id").primary();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("revocations");
}
