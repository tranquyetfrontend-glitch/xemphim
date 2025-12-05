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
        st.base_price,
        st.format,
        c.name AS cinema_name,
        c.address AS cinema_address,
        r.room_id,
        r.name AS room_name
        FROM booking.showtimes st
        JOIN catalog.rooms r ON st.room_id = r.room_id
        JOIN catalog.cinemas c ON r.cinema_id = c.cinema_id
        WHERE st.movie_id = $1
        AND st.start_time >= $2
        ORDER BY
        st.start_time;
    `;
    const result = await pool.query(sql, [movieId, today]); 
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
}