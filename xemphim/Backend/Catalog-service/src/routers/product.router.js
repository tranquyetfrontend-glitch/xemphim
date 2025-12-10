import express from 'express';
import { ProductController } from '../controllers/product.controller.js'; 

const router = express.Router();
const PRODUCT_CONTROLLER = new ProductController(); 

//API lấy danh sách combo, sản phẩm
router.get(
    '/products', 
    PRODUCT_CONTROLLER.getProducts.bind(PRODUCT_CONTROLLER) 
);

export default router;