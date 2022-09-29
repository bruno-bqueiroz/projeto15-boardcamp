import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

server.get('/status', (req, res) =>{
    res.send('ok');
})



server.listen(4000, () => console.log('listen on port 4000'));