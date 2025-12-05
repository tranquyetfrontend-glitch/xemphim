import {ShowtimeRepository} from '../repositories/showtime.repository.js'; 

const SHOWTIME_REPO = new ShowtimeRepository();

export class ShowtimeService{
    async getGroupedShowtimesByMovieId(movieId){
        const rawShowtimes = await SHOWTIME_REPO.getAllFutureShowtimesByMovieId(movieId);
        const groupedShowtimes = rawShowtimes.reduce((acc, showtime)=>{
            const cinemaName = showtime.cinema_name;
            if (!acc[cinemaName]){
                acc[cinemaName] ={
                    cinemaName: cinemaName,
                    address: showtime.cinema_address,
                    times: []
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
        return Object.values(groupedShowtimes);
    }
}