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

    async getSeatAvailability(req, res){
        try{
            const {showtimeId} = req.params;
            const seatMapData = await SHOWTIME_SERVICE.getSeatMapAndAvailability(showtimeId);
            console.log('Controller received data keys:', Object.keys(seatMapData));
            return res.status(200).json(seatMapData);
        }
        catch(error){
            console.error('Lỗi tại ShowtimeController (getSeatAvailability):', error);
            return res.status(500).json({error: 'Lỗi khi lấy sơ đồ ghế: ' + error.message});
        }
    }

    async getScheduleByDate(req, res){
        try{
            const { date } = req.query;
            if (!date){
                return res.status(400).json({ error: 'Thiếu thông tin ngày (date).' });
            }
            const schedule = await SHOWTIME_SERVICE.getScheduleByDate(date);
            return res.status(200).json(schedule);
        }
        catch(error){
            return res.status(500).json({ error: 'Lỗi server: ' + error.message });
        }
    }
}