import pool from '../configs/db.config.js';

export class UserRepository{
    async findByEmailOrUsername(identifier){
        const query = `
            SELECT user_id, password_hash, role, email
            FROM identity.users
            WHERE email = $1 OR username = $2
        `;
        const result = await pool.query(query,[identifier, identifier]);
        return result.rows?.[0]; 
    }
    
    async createUser(data){
        const query = `
            INSERT INTO identity.users (email, username, password_hash, full_name,phone, role) 
            VALUES ($1, $2, $3, $4, $5, 'CUSTOMER') 
            RETURNING user_id, email, full_name, role
        `;
        const result = await pool.query(query,[
            data.email,
            data.username,
            data.password_hash,
            data.full_name,
            data.phone||null  
        ]);
        return result.rows?.[0];
    }
}