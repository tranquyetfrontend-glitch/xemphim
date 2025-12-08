import {MovieRepository} from '../repositories/movie.repository.js';
import {ShowtimeService} from '../../booking/services/showtime.service.js'; 

const MOVIE_REPO = new MovieRepository();
const SHOWTIME_SERVICE = new ShowtimeService();

export class MovieService{
    async getMovieList(){
        return await MOVIE_REPO.findAllMovies();
    }
    async getMovieDetail(movieId) {
        const movie = await MOVIE_REPO.findMovieById(movieId);
        if (!movie){
            throw new Error('Phim không tồn tại.');
        }
        const groupedShowtimes = await SHOWTIME_SERVICE.getGroupedShowtimesByMovieId(movieId);
        return {
            ...movie,
            showtimes: groupedShowtimes
        };
    }
}