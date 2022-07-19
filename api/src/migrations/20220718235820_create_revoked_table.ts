import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("revoked", async table => {
        table.string("id").primary()
        table.timestamps(true, true)
      })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("revoked")
}

