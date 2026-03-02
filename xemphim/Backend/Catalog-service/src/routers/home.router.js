import express from 'express';
import { getHomeComposite } from '../controllers/home.controller.js';

const router = express.Router();

router.get('/home-composite', getHomeComposite);

export default router;