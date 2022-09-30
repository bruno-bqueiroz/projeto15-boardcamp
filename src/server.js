import express from 'express';
import cors from 'cors';
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

server.use(categoriesRoute);

/* server.get('/categories', async(req, res) =>{
    const categorias = await connection.query('SELECT * FROM categories;');
    console.log(categorias);
    res.send(categorias.rows);
}); */

server.post('/categories', async (req, res) => {
    const { name } = req.body;
     await connection.query ("INSERT INTO categories (name) values ($1);", [name]);
    res.sendStatus(201);
});

server.get('/games', async (req, res) => {
    const listaGames = await connection.query('SELECT * FROM games;');
    console.log(listaGames);
    res.send(listaGames.rows);
});

server.post('/games', async (req, res) =>{
    
    const {
        name,
        image,
        stockTotal,
        categoryId,
        pricePerDay
      } = req.body;
    await connection.query (`
    INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`, [name, image, stockTotal, categoryId, pricePerDay]);
    
    res.sendStatus(201)
})



server.get('/status', (req, res) =>{
    res.send('ok');
})
const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Listen on port ${PORT}`));