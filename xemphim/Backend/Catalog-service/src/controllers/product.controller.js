import { ProductService } from '../services/product.service.js';

const PRODUCT_SERVICE = new ProductService();

export class ProductController{
    async getProducts(req, res){
        try {
        const products = await PRODUCT_SERVICE.listAllProducts();
            return res.status(200).json(products);
        }
        catch (error){
            console.error('Lỗi tại ProductController (getProducts):', error);
            return res.status(500).json({error: 'Lỗi khi lấy danh sách sản phẩm.'});
        }
    }
}