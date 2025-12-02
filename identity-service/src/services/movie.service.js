import {MovieRepository} from '../repositories/movie.repository.js';
import {ShowtimeRepository} from '../repositories/showtime.repository.js';

const MOVIE_REPO =new MovieRepository();
const SHOWTIME_REPO = new ShowtimeRepository();

export class MovieService{
    async getMovieList(){
        return await MOVIE_REPO.findAllMovies();
    }
    async getMovieDetail(movieId){
        const movie = await MOVIE_REPO.findMovieById(movieId);
        if(!movie){
            throw new Error('Phim không tồn tại.');
        }
        const rawShowtimes = await SHOWTIME_REPO.getAllFutureShowtimesByMovieId(movieId);
        const groupedShowtimes = rawShowtimes.reduce((acc, showtime)=>{
            const cinemaName = showtime.cinema_name;
            if(!acc[cinemaName]){
                acc[cinemaName]={
                    cinemaName: cinemaName,
                    address: showtime.cinema_address,
                    times:[]
                };
            }
            acc[cinemaName].times.push({
                showtimeId: showtime.showtime_id,
                time: showtime.start_time,
                price: showtime.base_price,
                screenType: showtime.format 
            });
            return acc;
        }, {});
        return{
            ...movie,
            showtimes: Object.values(groupedShowtimes)
        };
    }
}