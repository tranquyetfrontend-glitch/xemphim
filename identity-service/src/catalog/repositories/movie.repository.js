import pool from '../../configs/db.config.js';

export class MovieRepository{
    async findNowShowingMovies(){
        const query=`
            SELECT movie_id, title,poster_url,rating_age_limit,duration_min
            FROM catalog.movies
            WHERE status = 'NOW_SHOWING'
            ORDER BY created_at DESC
        `;
        try{
            const result = await pool.query(query);
            return result.rows || [];
        } 
        catch(error){
            console.error("Lỗi MovieRepository - findNowShowingMovies:", error.message);
            throw new Error("Không thể truy vấn danh sách phim.");
        }
    }

}