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

    //Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status){
        const sql = `
        UPDATE booking.orders
        SET payment_status = $2, updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $1
        RETURNING order_id, showtime_id, payment_status;
        `;
        const result = await pool.query(sql, [orderId,status]);
        if(result.rows.length ===0){
            throw new Error(`Không tìm thấy đơn hàng ID: ${orderId}`);
        }
        return result.rows[0];
    }

    //Lấy danh sách ghế đã được giữ cho đơn hàng này
    async getHeldSeatsForOrder(orderId){
        const sql = `
        SELECT seat_res_id AS seat_id
        FROM booking.order_details
        WHERE order_id = $1 AND type = 'TICKET';
        `;
        const result = await pool.query(sql, [orderId]);
        return result.rows;
    }

    //Nhả ghế HELD về AVAILABLE (Dùng khi thanh toán thất bại)
    async releaseHeldSeats(orderId){
        const orderSql = `SELECT showtime_id FROM booking.orders WHERE order_id = $1`;
        const orderResult = await pool.query(orderSql, [orderId]);
        if(orderResult.rows.length === 0) return 0;
        const showtimeId = orderResult.rows[0].showtime_id;
        const seatIds = (await this.getHeldSeatsForOrder(orderId)).map(s => s.seat_id);
        if(seatIds.length === 0) return 0;
        const releaseSql = `
        UPDATE booking.seat_availability
        SET status = 'AVAILABLE', hold_expires_at = NULL
        WHERE 
        showtime_id = $1 
        AND seat_id = ANY($2::UUID[])
        AND status = 'HELD'
        RETURNING seat_id;
        `;
        const result = await pool.query(releaseSql, [showtimeId, seatIds]);
        return result.rowCount;
    }
}