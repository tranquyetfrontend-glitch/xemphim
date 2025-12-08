import pool from '../../common/configs/db.config.js';

export class UserRepository{
    async findByEmail(email){ 
        const query = `
            SELECT user_id, password_hash, role, email
            FROM identity.users
            WHERE email = $1 
        `;
        const result = await pool.query(query,[email]); 
        return result.rows?.[0]; 
    }
    
    async createUser(data){
        const query = `
            INSERT INTO identity.users (email, password_hash, full_name, phone, role) 
            VALUES ($1, $2, $3, $4, 'CUSTOMER') 
            RETURNING user_id, email, full_name, role
        `;
        const result = await pool.query(query,[
            data.email,
            data.password_hash,
            data.full_name,
            data.phone||null  
        ]);
        return result.rows?.[0];
    }

    async updateUserResetToken(userId, token, expiresAt){
        const query =`
            UPDATE identity.users
            SET reset_password_token = $2, 
            reset_password_expires = $3
            WHERE user_id = $1
            RETURNING user_id;
        `;
        await pool.query(query, [userId, token, expiresAt]);
    }

    async findUserByResetToken(token){
        const query =`
            SELECT *
            FROM identity.users
            WHERE reset_password_token = $1
            AND reset_password_expires > NOW()
        `;
        const result = await pool.query(query,[token]);
        return result.rows?.[0];
    }

    async updateUserPassword(userId, newPasswordHash){
        const query =`
            UPDATE identity.users
            SET password_hash = $2, 
            reset_password_token = NULL, 
            reset_password_expires = NULL,
            updated_at = NOW()
            WHERE user_id = $1
            RETURNING user_id;
        `;
        await pool.query(query, [userId, newPasswordHash]);
    }
}