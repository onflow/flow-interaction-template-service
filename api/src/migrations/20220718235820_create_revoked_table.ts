import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('revoked')
    const hasTable = await knex.schema.hasTable('revoked');
    console.log("HasTable (revoked) =", hasTable);
    await knex.schema.createTable("revoked", async table => {
        table.string("id").primary()
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("revoked")
}

