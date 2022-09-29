import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const connection = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '01234560',
    database: 'boardcamp',
})

const server = express();
server.use(cors());
server.use(express.json());

server.get('/categories', async(req, res) =>{
    const categorias = await connection.query('SELECT * FROM categories;');
    console.log(categorias);
    res.send(categorias.rows);
});

server.post('/categories', async (req, res) => {
    const { name } = req.body;
    const categorias = await connection.query ("INSERT INTO categories (name) values ($1);", [name]);

    console.log(categorias);

    res.sendStatus(200);
});




server.get('/status', (req, res) =>{
    res.send('ok');
})
server.listen(4000, () => console.log('listen on port 4000'));