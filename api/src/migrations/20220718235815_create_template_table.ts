import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('templates')
    await knex.schema.createTable("templates", async table => {
        table.string("id").primary()
        table.json("json_string")
        table.timestamps(true, true)
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("templates")
}

