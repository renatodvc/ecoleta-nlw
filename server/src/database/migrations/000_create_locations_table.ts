import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('locations', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.string('city').notNullable();
        table.string('state', 2).notNullable();
        table.string('image').notNullable();
        table.decimal('longitude', 9, 6).notNullable();
        table.decimal('latitude', 8, 6).notNullable(); // latitude range is -90 to 90
    })

}

export async function down(knex: Knex) {
    return knex.schema.dropTable('locations');
    
}