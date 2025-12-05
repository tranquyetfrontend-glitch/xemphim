import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import movieRouter from '../src/routers/movie.router.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

const corsOptions={
    origin: 'http://127.0.0.1:5500', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/movies', movieRouter);
app.listen(PORT,()=>{
    console.log(`Catalog Service đang chạy trên cổng: ${PORT}`);
});