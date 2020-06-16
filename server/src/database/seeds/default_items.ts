import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('items').insert([
        {title: 'Lâmpadas', image: 'lightbulb.svg'},
        {title: 'Pilhas e Baterias', image: 'battery.svg'},
        {title: 'Papéis e Papelão', image: 'paper.svg'},
        {title: 'Resíduos Eletrônicos', image: 'eletronic.svg'},
        {title: 'Resíduos Orgânicos', image: 'organic.svg'},
        {title: 'Óleo de Cozinha', image: 'oil.svg'},
    ]);
}