import cors from 'cors';
import express, { response, request } from 'express';
import path from 'path';
import routes from './routes'; 


const app = express();
app.use(cors(
    //origin: 'www.urldaapp.com'
))
app.use(express.json());
app.use(routes);
app.use('/images', express.static(path.resolve(__dirname, '..', 'images')));

app.listen(3333);