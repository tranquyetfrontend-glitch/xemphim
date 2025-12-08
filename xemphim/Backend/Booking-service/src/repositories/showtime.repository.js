import pool from '../../common/configs/db.config.js';

export class ShowtimeRepository{
    async getShowtimesByMovieAndDate(movieId, date){
        const query = `
        SELECT 
        st.showtime_id, 
        st.start_time,
        st.base_price,
        st.format,
        c.name AS cinema_name,
        c.address AS cinema_address
        FROM booking.showtimes st
        JOIN catalog.rooms r ON st.room_id = r.room_id
        JOIN catalog.cinemas c ON r.cinema_id = c.cinema_id
        WHERE st.movie_id = $1
        AND st.start_time::date = $2
        AND st.start_time > NOW()
        ORDER BY c.cinema_id, st.start_time;
    `;
    const result = await pool.query(query, [movieId, date]);
    return result.rows;
}

    async getAllFutureShowtimesByMovieId(movieId){
    const today = new Date().toISOString().split('T')[0];
    const sql = `
        SELECT
        st.showtime_id,
        st.start_time,
        st.end_time,
        st.format,
        st.base_price,
        st.room_id,
        r.name AS room_name,
        c.cinema_id, 
        c.name AS cinema_name, 
        c.address AS cinema_address
        FROM booking.showtimes st
        JOIN catalog.rooms r ON st.room_id = r.room_id
        JOIN catalog.cinemas c ON r.cinema_id = c.cinema_id  -- (3) JOIN với Cinemas
        WHERE st.movie_id = $1 AND st.start_time > NOW()
        ORDER BY 
        st.start_time;
    `;
    const result = await pool.query(sql, [movieId]);
    return result.rows;
    }

    async insertShowtime({ movieId, roomId, startTime, endTime, format, basePrice }){
        const sql = `
            INSERT INTO booking.showtimes 
            (movie_id, room_id, start_time, end_time, format, base_price)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING showtime_id;
        `;
        const result = await pool.query(sql,[
            movieId,
            roomId,
            startTime,
            endTime,
            format,
            basePrice
        ]);
        return result.rows[0];
    }

    async getSeatAvailability(showtimeId){
        const sql = `
        SELECT 
        seat_id,
        status,
        hold_expires_at
        FROM booking.seat_availability 
        WHERE showtime_id = $1;
        `;
        const result = await pool.query(sql, [showtimeId]);
        return result.rows; 
    }

    async findShowtimeById(showtimeId) {
        const sql = `
        SELECT
        st.showtime_id,
        st.room_id,
        st.base_price,
        st.start_time,
        r.name AS room_name,
        r.cinema_id
        FROM booking.showtimes st
        JOIN catalog.rooms r ON st.room_id = r.room_id
        WHERE st.showtime_id = $1;
        `;
        const result = await pool.query(sql, [showtimeId]);
        return result.rows[0];
    }
}