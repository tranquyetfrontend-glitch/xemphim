import express from 'express';
import * as dotenv from 'dotenv';
import {register, login} from './src/controllers/auth.controller.js'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT||3001;

app.use(express.json()); 
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.listen(PORT, () => {
    console.log(`Identity Service đang chạy trên cổng: ${PORT}`);
});