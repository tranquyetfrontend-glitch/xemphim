import { MovieRepository } from '../repositories/movie.repository.js'; 
import axios from 'axios';

const MOVIE_REPO = new MovieRepository();
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

export class MovieService{
    async getMovieList(){
        return await MOVIE_REPO.findAllMovies();
    }
    async getMovieDetail(movieId){
        const movie = await MOVIE_REPO.findMovieById(movieId);
        if(!movie){
            throw new Error('Phim không tồn tại.');
        }
        let groupedShowtimes = [];
        try {
            const response = await axios.get(
                `${BOOKING_SERVICE_URL}/api/showtimes/grouped-by-movie/${movieId}`
            );
            groupedShowtimes = response.data;
        }
        catch (error){
            console.error("Lỗi khi gọi Booking Service để lấy lịch chiếu:", error.message);
            groupedShowtimes = []; 
        }
        return {
            ...movie,
            showtimes: groupedShowtimes
        };
    }
}