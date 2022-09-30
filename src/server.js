import express from 'express';
import cors from 'cors';
import joi from 'joi';
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

import categoriesRoute from './routes/categories.Route.js'


const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

const server = express();
server.use(cors());
server.use(express.json());

/* server.use(categoriesRoute); */

const categoriesSchema = joi.object({
    name: joi.string().required()
});

const gamesSchema = joi.object({
    name: joi.string().required(),
    image: joi.string(),
    stockTotal: joi.number().greater(0),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().greater(0)
})

 server.get('/categories', async(req, res) =>{
    const categorias = await connection.query('SELECT * FROM categories;');
    console.log(categorias);
    res.send(categorias.rows);
}); 

server.post('/categories', async (req, res) => {
    const validation = categoriesSchema.validate(req.body);
    if (validation.error) return res.sendStatus(400);
    const { name } = req.body;

    try {
    const categorias = await connection.query ('SELECT * FROM categories;');
    const temCategoria = categorias.rows.find(value => value.name === name);
    if (temCategoria) return res.sendStatus(409);

    await connection.query ("INSERT INTO categories (name) values ($1);", [name]);

    } catch (error) {
        res.sendStatus(error);
    }
    
    res.sendStatus(201);
});

server.get('/games', async (req, res) => {
    const queryName =  req.query.name;
    if (queryName){
        const listaGames = await connection.query(`SELECT * FROM games WHERE name ILIKE '${queryName}%';`);
    console.log(listaGames);
    return res.send(listaGames.rows);
    }
    
    const listaGames = await connection.query(`SELECT * FROM games;`);
    console.log(listaGames);
    res.send(listaGames.rows);
});

server.post('/games', async (req, res) =>{
    const validation = gamesSchema.validate(req.body);

    if(validation.error) return res.sendStatus(400);
    const {
        name,
        image,
        stockTotal,
        categoryId,
        pricePerDay
      } = req.body;

      try {
        const listaCategories = await connection.query ('SELECT * FROM categories;')

        const temCategories = listaCategories.rows.find (value => value.id === categoryId);
    if(!temCategories) return res.sendStatus(400);

    const listaGames = await connection.query ('SELECT * FROM games;');
    const temGame = listaGames.rows.find (value => value.name === name);

    if(temGame) return res.sendStatus(409);
    
    await connection.query (`
    INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`, [name, image, stockTotal, categoryId, pricePerDay]);
    
      } catch (error) {
        res.sendStatus(error)
      }

      res.sendStatus(201)
    
})

server.get('/customers', async (req, res) =>{
    const listaDeUsuarios = await connection.query ('SELECT * FROM customers;');
    res.send(listaDeUsuarios.rows);
})

server.post('/customers', async (req, res) =>{
    const { name, phone, cpf, birthday } = req.body;

    await connection.query (`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday]);
    
    res.sendStatus(201);
})


server.get('/status', (req, res) =>{
    res.send('ok');
})
const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Listen on port ${PORT}`));