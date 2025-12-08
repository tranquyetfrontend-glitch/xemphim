import {ShowtimeRepository} from '../repositories/showtime.repository.js';
import axios from 'axios';
import dayjs from 'dayjs';

const SHOWTIME_REPO = new ShowtimeRepository();
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3002';

const groupShowtimes = (showtimes)=>{
    const groupedData ={};
    showtimes.forEach(showtime =>{
        const dateKey = dayjs(showtime.start_time).format('YYYY-MM-DD');
        const cinemaKey = showtime.cinema_name;
        if (!groupedData[dateKey]){
            groupedData[dateKey] ={
                date: dateKey,
                cinemas: {}
            };
        }
        if (!groupedData[dateKey].cinemas[cinemaKey]){
            groupedData[dateKey].cinemas[cinemaKey] ={
                cinema_name: showtime.cinema_name,
                cinema_address: showtime.cinema_address,
                showtimes: []
            };
        }
        groupedData[dateKey].cinemas[cinemaKey].showtimes.push({
            showtime_id: showtime.showtime_id,
            start_time: dayjs(showtime.start_time).format('HH:mm'),
            base_price: showtime.base_price,
            format: showtime.format,
            room_name: showtime.room_name,
            room_id: showtime.room_id
        });
    });
    const finalResult = Object.values(groupedData).map(day =>({
        ...day,
        cinemas: Object.values(day.cinemas)
    }));
    return finalResult;
};

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

    async getSeatAvailability(req, res){
        try{
            const showtimeId = req.params.showtimeId;
            if(!showtimeId){
                return res.status(400).json({error: 'Thiếu Showtime ID.'});
            }
            const seatData = await SHOWTIME_SERVICE.getSeatMapAndAvailability(showtimeId); 
            return res.status(200).json(seatData); 
        }
        catch(error){
            console.error('Lỗi tại ShowtimeController (getSeatAvailability):', error);
            return res.status(500).json({error: 'Lỗi khi lấy sơ đồ ghế: ' + error.message});
        }
    }

    async getSeatMapAndAvailability(showtimeId){
        const showtimeInfo = await SHOWTIME_REPO.findShowtimeById(showtimeId); 
        if(!showtimeInfo){
            throw new Error('Suất chiếu không tồn tại.');
        }
        const roomId = showtimeInfo.room_id;
        const seatMapResponse = await axios.get(
            `${CATALOG_SERVICE_URL}/api/rooms/${roomId}/seats`
        );
        const physicalSeats = seatMapResponse.data;
        const seatAvailability = await SHOWTIME_REPO.getSeatAvailability(showtimeId);
        const availabilityMap = new Map();
        seatAvailability.forEach(s =>{
            availabilityMap.set(s.seat_id, s); 
        });
        const finalSeatMap = physicalSeats.map(seat=>{
            const availability = availabilityMap.get(seat.seat_id);
            const status = availability ? availability.status : 'AVAILABLE';
            const holdExpiresAt = null;
            return{
                ...seat,
                status: status, 
                hold_expires_at: holdExpiresAt
            };
        });
        return{
            showtime_id: showtimeId,
            room_id: roomId,
            room_name: showtimeInfo.room_name,
            seat_map: finalSeatMap,
            base_price: showtimeInfo.base_price 
        };
    }
}