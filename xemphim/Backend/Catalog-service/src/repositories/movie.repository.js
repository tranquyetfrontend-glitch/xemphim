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

    async getHomeCompositeData(){
        const client = await pool.connect();
        try {
            const nowShowingQuery = client.query(`
                SELECT movie_id, title, poster_url, age_rating, description 
                FROM catalog.movies WHERE status = 'NOW_SHOWING' LIMIT 10
            `);

            const comingSoonQuery = client.query(`
                SELECT movie_id, title, poster_url, age_rating, release_date 
                FROM catalog.movies WHERE status = 'COMING_SOON' LIMIT 10
            `);

            const actionQuery = client.query(`
                SELECT movie_id, title, poster_url, age_rating, 'Hành động' as sub
                FROM catalog.movies 
                WHERE description ILIKE '%Hành động%' OR title ILIKE '%Hành động%' 
                LIMIT 8
            `);

            const romanceQuery = client.query(`
                SELECT movie_id, title, poster_url, age_rating, 'Tình cảm' as sub
                FROM catalog.movies 
                WHERE description ILIKE '%Tình cảm%' OR description ILIKE '%Lãng mạn%'
                LIMIT 8
            `);

            const horrorQuery = client.query(`
                SELECT movie_id, title, poster_url, age_rating, 'Kinh dị' as sub
                FROM catalog.movies 
                WHERE description ILIKE '%Kinh dị%' OR description ILIKE '%Ma%'
                LIMIT 8
            `);

            const rankingQuery = client.query(`
                SELECT movie_id, title, poster_url, age_rating, 9.5 as score, 'Kinh điển' as sub
                FROM catalog.movies 
                ORDER BY release_date DESC LIMIT 5
            `);

            const [now, coming, action, romance, horror, rank] = await Promise.all([
                nowShowingQuery, comingSoonQuery, actionQuery, romanceQuery, horrorQuery, rankingQuery
            ]);
            return{
                nowShowing: now.rows,
                comingSoon: coming.rows,
                action: action.rows,
                romance: romance.rows,
                horror: horror.rows,
                ranking: rank.rows
            };
        }
        catch (error){
            console.error("Lỗi Repository getHomeCompositeData:", error.message);
            throw error;
        }
        finally{
            client.release();
        }
    }
}