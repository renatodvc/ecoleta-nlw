import express, { request, response } from 'express';
import knex from './database/connection';

import DropoffLocationsController from './controllers/locationsController';
import ItemsController from './controllers/itemsController';

const routes = express.Router();
const spotsController = new DropoffLocationsController();
const itemsController = new ItemsController();

// List items
routes.get('/items', itemsController.index);
// List locations - Filter by query params
routes.get('/locations', spotsController.index);
// Add location
routes.post('/locations', spotsController.create);
// Details
routes.get('/locations/:id', spotsController.show);

export default routes; 