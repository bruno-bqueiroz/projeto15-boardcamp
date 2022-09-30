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

const customersSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().required().min(10).max(11),
    cpf: joi.string().required().min(10).max(11),
    birthday: joi.date().required()
})


 server.get('/categories', async(req, res) =>{

    try {
        const categorias = await connection.query('SELECT * FROM categories;');
        res.send(categorias.rows);
    } catch (error) {
        res.send(error)
    }
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
    try {
        if (queryName){
            const listaGames = await connection.query(`SELECT * FROM games WHERE name ILIKE '${queryName}%';`);
        console.log(listaGames);
        return res.send(listaGames.rows);
        }
        const listaGames = await connection.query(`SELECT * FROM games;`);
        res.send(listaGames.rows);
    } catch (error) {
        res.send(error)
    }
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
    const queryCpf =  req.query.cpf;

    try {
        if (queryCpf){
            const listaDeUsuarios = await connection.query(`SELECT * FROM customers WHERE cpf ILIKE '${queryCpf}%';`);
    
        return res.send(listaDeUsuarios.rows);
        }
        const listaDeUsuarios = await connection.query ('SELECT * FROM customers;');
        res.send(listaDeUsuarios.rows);

    } catch (error) {
        res.send(error)
    }
})

server.get('/customers/:id', async (req, res) =>{
    const id = req.params.id;
    try {
        const usuario = await connection.query (`SELECT * FROM customers WHERE id = ${id}`);
    if(!usuario) return res.sendStatus(404)
    res.send(usuario.rows[0]);
    } catch (error) {
        res.send(error)
    } 
});

server.post('/customers', async (req, res) =>{
    const validation = customersSchema.validate(req.body);
    console.log(validation.error);
    if(validation.error) return res.sendStatus(400);

    const { name, phone, cpf, birthday } = req.body;

    try {
        const listaDeUsuarios = await connection.query ('SELECT * FROM customers;');
    const temcpf = listaDeUsuarios.rows.find (value => value.cpf === cpf);
    if(temcpf) return res.sendStatus(409);

    await connection.query (`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)`, [name, phone, cpf, birthday]);
    } catch (error) {
        res.send(error)
    }
    res.sendStatus(201);
})

server.put('/customers/:id', async (req, res) =>{
    const id = req.params.id;

    const validation = customersSchema.validate(req.body);
    console.log(validation.error);
    if(validation.error) return res.sendStatus(400);

    const { name, phone, cpf, birthday } = req.body;

    try {
        const listaDeUsuarios = await connection.query ('SELECT * FROM customers;');
    const temcpf = listaDeUsuarios.rows.find (value => value.cpf === cpf);
    if(temcpf) return res.sendStatus(409);
    
    await connection.query (`UPDATE customers SET (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4) WHERE id = ${id}`, [name, phone, cpf, birthday]);
    } catch (error) {
        res.send(error)
    }
    res.sendStatus(201);
})



server.get('/status', (req, res) =>{
    res.send('ok');
})
const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Listen on port ${PORT}`));