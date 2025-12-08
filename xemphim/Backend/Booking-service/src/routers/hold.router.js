import express from 'express';
import {HoldController} from '../controllers/hold.controller.js'

const router = express.Router();
const HOLD_CONTROLLER = new HoldController();

router.post(
    '/hold-seats', 
    HOLD_CONTROLLER.holdSeats.bind(HOLD_CONTROLLER) 
);

export default router;