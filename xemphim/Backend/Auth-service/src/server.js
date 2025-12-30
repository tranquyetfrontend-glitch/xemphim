import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRouter from '../src/routers/auth.router.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions={
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://xemphim-bc3o.vercel.app',
        /^https:\/\/xemphim-bc3o-.*\.vercel\.app$/
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((err, req, res, next)=>{
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err){
        console.error('Lỗi Cú pháp JSON từ Client:', req.url, err.message);
        return res.status(400).send({ 
            error: 'Invalid JSON syntax. Please ensure all property names are double-quoted.' 
        }); 
    }
    next(err);
});
app.use('/api/auth', authRouter);
app.listen(PORT, ()=>{
    console.log(`Auth Service đang chạy trên cổng: ${PORT}`);
});