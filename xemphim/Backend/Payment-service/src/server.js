import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import paymentRouter from '../src/routers/payment.router.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());
app.use('/api/payments', paymentRouter);
app.listen(PORT, () => {
    console.log(`Payment Service đang chạy trên cổng: ${PORT}`);
});