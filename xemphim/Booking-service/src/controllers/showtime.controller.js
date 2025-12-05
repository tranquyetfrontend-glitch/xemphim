import { ShowtimeService } from '../services/showtime.service.js';

const SHOWTIME_SERVICE = new ShowtimeService(); 

export class ShowtimeController{
    async getGroupedShowtimesByMovieId(req, res){
        try{
            const movieId = req.params.movieId;
            if(!movieId){
                return res.status(400).json({error: 'Thiếu Movie ID.'});
            }
            const groupedShowtimes = await SHOWTIME_SERVICE.getGroupedShowtimesByMovieId(movieId);
            return res.status(200).json(groupedShowtimes); 
        }
        catch(error){
            console.error('Lỗi tại ShowtimeController:', error);
            return res.status(500).json({error: 'Lỗi khi lấy lịch chiếu: ' + error.message});
        }
    }
}