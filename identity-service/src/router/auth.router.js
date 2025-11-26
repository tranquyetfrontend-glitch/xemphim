import express from 'express';
import {authenticateToken, authorizeRole} from '../common/utils/auth.middleware.js'; 
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/admin/movies', 
    authenticateToken,
    authorizeRole('ADMIN'), 
    catalogController.createMovie
); 
router.post('/token/refresh',authController.refreshToken);

export default router;