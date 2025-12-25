import pool from '../../common/configs/db.config.js';

class AuthRepository{
    async findById(id){
        const query = 'SELECT * FROM user WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
    async updateUser(id, { full_name, phone, address}){
        const query = `
        UPDATE users
        SET full_name = $1, phone = $2, address = $3
        WHERE id = $4
        RETURNING id, email, full_name, phone, address
        `;
        const values = [full_name, phone, address, id];
        const result = await db.query(query, values);
        return result.rows[0];
    }
}

module.exports = new AuthRepository();