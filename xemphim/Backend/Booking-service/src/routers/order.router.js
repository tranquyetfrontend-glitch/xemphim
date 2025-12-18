import express from 'express';
import { OrderController } from '../controllers/order.controller.js';

const router = express.Router();
const ORDER_CONTROLLER = new OrderController();

router.post(
    '/create',
    ORDER_CONTROLLER.createOrder.bind(ORDER_CONTROLLER)
);
router.post(
    '/confirm',
    ORDER_CONTROLLER.confirmOrder.bind(ORDER_CONTROLLER)
);

export default router;