import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import paymentRouter from '../src/routers/payment.router.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;

const corsOptions = {
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'https://xemphim-bc3o.vercel.app',
        /^https:\/\/xemphim-bc3o-.*\.vercel\.app$/
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/payments', paymentRouter);
app.listen(PORT, () => {
    console.log(`Payment Service đang chạy trên cổng: ${PORT}`);
});