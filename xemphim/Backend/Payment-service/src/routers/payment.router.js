import express from 'express';
import { PaymentController } from '../controllers/payment.controller.js';

const router = express.Router();
const PAYMENT_CONTROLLER = new PaymentController();

router.post(
    '/create',
    PAYMENT_CONTROLLER.createPaymentLink.bind(PAYMENT_CONTROLLER)
);
router.post(
    '/callback',
    PAYMENT_CONTROLLER.handlePaymentCallback.bind(PAYMENT_CONTROLLER)
);

export default router;