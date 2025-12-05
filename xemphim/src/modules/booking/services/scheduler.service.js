import {MovieRepository} from '../../catalog/repositories/movie.repository.js';
import {ShowtimeRepository} from '../repositories/showtime.repository.js';

const MOVIE_REPO = new MovieRepository();
const SHOWTIME_REPO = new ShowtimeRepository();
const TURNAROUND_MINUTES = 20;
const SHOWTIME_CONFIG = [
    { time: '10:00', format: '2D', price: 90000 },
    { time: '13:30', format: '3D', price: 120000 },
    { time: '17:00', format: '2D', price: 100000 },
    { time: '20:30', format: '3D', price: 120000 },
];

export class SchedulerService {
    async getAllRooms() {
        return [
            {room_id: 1, cinema_id: 1}, 
            {room_id: 2, cinema_id: 1} 
        ];
    }
    async generateShowtimes(daysAhead = 7){
        console.log(`BẮT ĐẦU TẠO LỊCH CHIẾU (${daysAhead} ngày)`);
        const movies = await MOVIE_REPO.findAllMovies();
        const rooms = await this.getAllRooms();
        console.log(`Kiểm tra dữ liệu: Phim: ${movies.length} | Phòng: ${rooms.length}`);

        if(movies.length === 0 || rooms.length === 0){
            console.log('HỦY TẠO LỊCH: Không có phim hoặc phòng chiếu để tạo lịch.');
            return {message: 'Không có phim hoặc phòng chiếu. Hủy tạo lịch.'};
        }
        let newShowtimesCount = 0;
        let errorsLogged = 0;
        for(let i = 1; i <= daysAhead; i++){
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            for(const room of rooms){
                for(const movie of movies){
                    for(const config of SHOWTIME_CONFIG){
                        const startDateTime = new Date(`${dateStr}T${config.time}:00+07:00`);
                        const movieDuration = movie.duration_minutes || 100;
                        const totalTimeMinutes = movieDuration + TURNAROUND_MINUTES;
                        const durationMs = totalTimeMinutes * 60 * 1000;
                        const endDateTime = new Date(startDateTime.getTime() + durationMs);
                        try{
                            await SHOWTIME_REPO.insertShowtime({
                                movieId: movie.movie_id,
                                roomId: room.room_id,
                                startTime: startDateTime,
                                endTime: endDateTime,
                                format: config.format,
                                basePrice: config.price
                            });
                            newShowtimesCount++;
                        }
                        catch(error){
                            console.error(`Lỗi chèn [${dateStr} - ${config.time}] (Phòng ${room.room_id}): ${error.message}`);
                            errorsLogged++;
                        }
                    }
                }
            }
        }
        console.log(`KẾT THÚC TẠO LỊCH CHIẾU`);
        console.log(`Đã tạo thành công: ${newShowtimesCount} suất chiếu.`);
        if(errorsLogged > 0){
            console.warn(`Có ${errorsLogged} lỗi đã được ghi nhận trong quá trình chèn.`);
        }
        return{ 
            message: `Đã tạo ${newShowtimesCount} suất chiếu.`,
            createdCount: newShowtimesCount
        };
    }
}