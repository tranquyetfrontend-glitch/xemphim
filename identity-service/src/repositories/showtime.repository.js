import pool from '../configs/db.config.js';

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
        JOIN catalog.cinemas c ON st.cinema_id = c.cinema_id
        WHERE st.movie_id = $1
        AND st.start_time::date = $2
        AND st.start_time > NOW()
        ORDER BY c.cinema_id, st.start_time;
    `;
    const result = await pool.query(query, [movieId, date]);
    return result.rows;
}

    async getAllFutureShowtimesByMovieId(movieId) {
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
        FROM
        booking.showtimes st
        JOIN
        catalog.cinemas c ON st.cinema_id = c.cinema_id
        JOIN 
        catalog.rooms r ON st.room_id = r.room_id
        WHERE
        st.movie_id = $1
        AND st.start_time >= $2
        ORDER BY
        st.start_time;
    `;
    const result = await pool.query(sql, [movieId, today]); 
    return result.rows;
}
}