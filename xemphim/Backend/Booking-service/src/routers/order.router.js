import express from 'express';
import { OrderController } from '../controllers/order.controller.js';

const router = express.Router();
const ORDER_CONTROLLER = new OrderController();

router.post(
    '/create',
    ORDER_CONTROLLER.createOrder.bind(ORDER_CONTROLLER)
);

export default router;