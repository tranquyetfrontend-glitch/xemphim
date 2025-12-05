import pool from '../../common/configs/db.config.js';

export class MovieRepository{
    async findAllMovies(){
        const query = `
            SELECT 
            movie_id, 
            title, 
            description,
            poster_url, 
            duration_minutes, 
            release_date, 
            age_rating,
            status
            FROM catalog.movies
            WHERE status IN ('NOW_SHOWING', 'COMING_SOON') 
            ORDER BY release_date DESC;
        `;
        try{
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error("Lỗi Repository findAllMovies:", error.message);
            throw error;
        }
    }

    async findMovieById(movieId){
        const query = `
            SELECT *
            FROM catalog.movies
            WHERE movie_id = $1;
        `;
        const result = await pool.query(query, [movieId]);
        return result.rows?.[0];
    }
}