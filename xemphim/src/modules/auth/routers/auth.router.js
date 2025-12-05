import express from 'express';
import { authenticateToken, authorizeRole } from '../../../common/middlewares/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';
import movieRouter from '../../catalog/routers/movie.router.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;