import cron from 'node-cron';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import {SchedulerService} from '../src/services/scheduler.service.js';
import {SchedulerController} from '../src/controllers/scheduler.controller.js';
import showtimeRouter from '../src/routers/showtime.router.js';
import holdRouter from '../src/routers/hold.router.js'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

const corsOptions={
    origin: 'http://127.0.0.1:5500', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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
        .then(() =>console.log('Cron Job tạo lịch chiếu hoàn thành.'))
        .catch(err =>console.error('Lỗi Cron Job tạo lịch chiếu:', err));
});

app.use(cors(corsOptions));
app.use(express.json());
app.get('/api/scheduler/generate', SCHEDULER_CONTROLLER.generateShowtimes);
app.use('/api/showtimes', showtimeRouter);
app.use(express.json());
app.use('/api/bookings', holdRouter);
app.listen(PORT, ()=>{
    console.log(`Booking Service đang chạy trên cổng: ${PORT}`);
});