import express from 'express';
import { verifyToken } from '../../common/middlewares/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', verifyToken, authController.getMe);
router.put('/update-profile', verifyToken, authController.updateProfile);
export default router;