import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRouter from './src/router/auth.router.js';
import movieRouter from './src/router/movie.router.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT||3001;
const corsOptions={
    origin:'http://127.0.0.1:5500', 
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/api/auth', authRouter);
app.listen(PORT, () => {
    console.log(`Identity Service đang chạy trên cổng: ${PORT}`);
});
app.use('/api/movies', movieRouter);