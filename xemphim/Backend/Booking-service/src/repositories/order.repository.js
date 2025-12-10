import pool from '../../common/configs/db.config.js';

export class OrderRepository{
    //Tạo đơn hàng mới
    async createOrder(userId, showtimeId, totalAmount){ 
        const sql = `
        INSERT INTO booking.orders (user_id, showtime_id, total_amount, payment_status)
        VALUES ($1, $2, $3, 'PENDING')
        RETURNING order_id, total_amount, payment_status, created_at;
        `;
        const result = await pool.query(sql, [userId, showtimeId, totalAmount]); 
        return result.rows[0];
    }

    //Tạo chi tiết đơn hàng
    async createOrderDetail(orderId, type, price, quantity, seatId = null, productId = null){
        const sql = `
        INSERT INTO booking.order_details (order_id, type, price, quantity, seat_res_id, product_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `;
        const result = await pool.query(sql,[orderId, type, price, quantity, seatId, productId]);
        return result.rows[0];
    }

    //chuyển trạng thái ghế từ HELD sang BOOKED (sau khi thanh toán thành công)
    async bookSeats(showtimeId, seatIds){
        const sql = `
        UPDATE booking.seat_availability
        SET status = 'BOOKED', hold_expires_at = NULL
        WHERE
        showtime_id = $1
        AND seat_id = ANY($2::UUID[])
        AND status = 'HELD'
        RETURNING seat_id;
        `;
        const result = await pool.query(sql, [showtimeId,seatIds]);
        return result.rows;
    }

    //lấy thông tin giá suất chiếu và giá combo
    async getPricingInfo(showtimeId, seatIds, comboItems){
        const showtimeSql = `
        SELECT
        s.base_price,
        ps.seat_id,
        ps.type,
        (SELECT status FROM booking.seat_availability sa WHERE sa.showtime_id = $1 AND sa.seat_id = ps.seat_id) as status
        FROM booking.showtimes s
        JOIN catalog.rooms r ON s.room_id = r.room_id
        JOIN catalog.physical_seats ps ON ps.room_id = r.room_id
        WHERE s.showtime_id = $1 AND ps.seat_id = ANY($2::UUID[]);
        `;
        const showtimeResult = await pool.query(showtimeSql, [showtimeId, seatIds]);
        if(showtimeResult.rows.some(row=> row.status !== 'HELD')){
            throw new Error('Có ghế chưa được giữ (HELD) hoặc đã bị bán (BOOKED).');
        }
        const productIds = comboItems.map(item => item.product_id);
        let comboPrices = [];
        if(productIds.length>0){
            const productSql = `
            SELECT product_id, price FROM catalog.products
            WHERE product_id = ANY($1::int[]);
            `;
            const productResult = await pool.query(productSql, [productIds]);
            comboPrices = productResult.rows;
        }
        return {seatInfo: showtimeResult.rows, comboPrices: comboPrices};
    }
}