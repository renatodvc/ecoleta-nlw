import {Request, Response} from 'express';
import knex from '../database/connection';

class DropoffLocationsController {
    async index (request: Request, response: Response) {

        const { city, state, items } = request.query;
        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const locations = await knex('locations')
            .join('locations_items', 'locations.id', '=', 'locations_items.location_id')
            .whereIn('locations_items.item_id', parsedItems)
            .where('city', String(city))
            .where('state', String(state))
            .distinct()
            .select('locations.*');


        return response.json(locations)
    }

    async show (request: Request, response: Response) {
        const { id } = request.params;
        const location = await knex('locations').where('id', id).first();

        if (!location) {
            return response.status(400).json({message: 'Drop-off location not found.'})
        }

        const items = await knex('items')
            .join('locations_items', 'items.id', '=', 'locations_items.item_id')
            .where('locations_items.location_id', id)
            .select('items.title');

        return response.json({
            location,
            items,
        });

    }

    async create (request: Request, response: Response) {
        const {
            name,
            email, 
            whatsapp,
            city,
            state,
            longitude,
            latitude,
            items
        } = request.body;
    
        const trx = await knex.transaction();
        const locationData = {
            name,
            email, 
            whatsapp,
            city,
            state,
            longitude,
            latitude,
            image: 'https://images.unsplash.com/photo-1584771145729-0bd9fda6529b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', //placeholder
        }
        const locationInsert = await trx('locations').insert(locationData);
        const locationId = locationInsert[0]
        const locationItems = items.map((item_id: number) => {
            return {
                item_id,
                location_id: locationId,
            }
        });
        await trx('locations_items').insert(locationItems);
        await trx.commit();
    
        return response.json({
            id: locationId,
            ... locationData
        }); 
    }
}

export default DropoffLocationsController;