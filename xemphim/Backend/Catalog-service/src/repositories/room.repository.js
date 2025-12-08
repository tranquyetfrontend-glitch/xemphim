import pool from '../../common/configs/db.config.js';

export class RoomRepository{
    async getPhysicalSeatByRoomId(roomId){
        const sql = `
        SELECT 
        seat_id,
        row_label, 
        seat_number, 
        type, 
        is_active 
        FROM catalog.physical_seats 
        WHERE room_id = $1
        ORDER BY row_label, seat_number; 
        `;
        const result = await pool.query(sql, [roomId]);
        return result.rows;
    }
}