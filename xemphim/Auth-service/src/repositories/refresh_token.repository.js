import pool from '../../common/configs/db.config.js';
export class RefreshTokenRepository{
    async saveToken(userId,token,expiresAt){
        const query=`
        INSERT INTO identity.refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING token;
        `;
        await pool.query(query, [userId, token, expiresAt]);
        return true;
    }

    async findValidToken(token){
        const query = `
        SELECT *
        FROM identity.refresh_tokens
        WHERE token = $1
        AND is_revoked = FALSE
        AND expires_at > NOW()
        `;
        const result = await pool.query(query, [token]);
        return result.rows?.[0];
    }

    async revokeToken(token){
        const query = `
        UPDATE identity.refresh_tokens
        SET is_revoked = TRUE
        WHERE token = $1
        RETURNING token_id;
        `;
        const result = await pool.query(query, [token]);
        return result.rowCount > 0;
    }
}