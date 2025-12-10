import { ProductRepository } from '../repositories/product.repository.js';

const PRODUCT_REPO = new ProductRepository();

export class ProductService{
    async listAllProducts(){
        return PRODUCT_REPO.getAllProducts();
    }
}