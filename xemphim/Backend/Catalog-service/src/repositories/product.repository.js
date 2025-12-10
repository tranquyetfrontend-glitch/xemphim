import pool from '../../common/configs/db.config.js';

export class ProductRepository{
    async getAllProducts(){
        const sql = `
        SELECT product_id, name, price, image_url 
        FROM catalog.products;
        `;
        const result = await pool.query(sql);
        return result.rows;
    }
}