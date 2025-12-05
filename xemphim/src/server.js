import cron from 'node-cron';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRouter from '../src/modules/auth/routers/auth.router.js';
import movieRouter from '../src/modules/catalog/routers/movie.router.js';
import {SchedulerService} from '../src/modules/booking/services/scheduler.service.js';
import { SchedulerController } from '../src/modules/booking/controllers/scheduler.controller.js';

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
const SCHEDULER_SERVICE = new SchedulerService();
const SCHEDULER_CONTROLLER = new SchedulerController();
cron.schedule('0 1 * * *', ()=>{
    const today = new Date().toLocaleString();
    console.log(`[${today}] Bắt đầu chạy Cron Job tạo lịch chiếu tự động...`);
    SCHEDULER_SERVICE.generateShowtimes(7)
        .then(() => console.log('Cron Job tạo lịch chiếu hoàn thành.'))
        .catch(err => console.error('Lỗi Cron Job tạo lịch chiếu:', err));
});

app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/api/auth', authRouter);
app.listen(PORT, () => {
    console.log(`Identity Service đang chạy trên cổng: ${PORT}`);
});
app.use('/api/movies', movieRouter);
app.get('/api/scheduler/generate', SCHEDULER_CONTROLLER.generateShowtimes);