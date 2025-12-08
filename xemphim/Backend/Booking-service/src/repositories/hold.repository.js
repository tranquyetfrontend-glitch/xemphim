import pool from '../../common/configs/db.config.js';

export class HoldRepository{
    async getSeatsStatus(showtimeId, seatIds){
        const sql = `
         SELECT 
        seat_id, 
        status, 
        hold_expires_at 
        FROM booking.seat_availability 
        WHERE showtime_id = $1 AND seat_id = ANY($2::UUID[]);
        `;
        const result = await pool.query(sql, [showtimeId, seatIds]);
        return result.rows;
    }

    async holdSeats(showtimeId, seatId, newStatus, expiresAt){
        const sql = `
        INSERT INTO booking.seat_availability (showtime_id, seat_id, status, hold_expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (showtime_id, seat_id) DO UPDATE
        SET 
        status = EXCLUDED.status,
        hold_expires_at = EXCLUDED.hold_expires_at
        RETURNING *;
        `;
        const result = await pool.query(sql, [showtimeId, seatId, newStatus, expiresAt]);
        return result.rows[0];
    }
    
    async releaseExpiredHolds(showtimeId){
        const sql = `
        UPDATE booking.seat_availability
        SET status = 'AVAILABLE', hold_expires_at = NULL
        WHERE 
        showtime_id = $1 
        AND status = 'HELD' 
        AND hold_expires_at < NOW();
        `;
        await pool.query(sql, [showtimeId]);
    }
}