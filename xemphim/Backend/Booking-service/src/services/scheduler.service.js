import axios from 'axios';
import * as dotenv from 'dotenv';
import { ShowtimeRepository } from '../repositories/showtime.repository.js';

dotenv.config();

const SHOWTIME_REPO = new ShowtimeRepository();
const TURNAROUND_MINUTES = 20;

// Sử dụng environment variable, fallback về localhost nếu không có
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL 
    ? `${process.env.CATALOG_SERVICE_URL}/api/movies`
    : 'http://localhost:3002/api/movies';

const SHOWTIME_CONFIG =[
    { time: '10:00', format: '2D', price: 90000 },
    { time: '13:30', format: '3D', price: 120000 },
    { time: '17:00', format: '2D', price: 100000 },
    { time: '20:30', format: '3D', price: 120000 },
];

export class SchedulerService{
    async getAllRooms(){
        return[
            {room_id: 1, cinema_id: 1},
            {room_id: 2, cinema_id: 1}
        ];
    }

    async generateShowtimes(daysAhead = 7){
        console.log(`BẮT ĐẦU TẠO LỊCH CHIẾU (${daysAhead} ngày)`);
        try{
            const response = await axios.get(`${CATALOG_SERVICE_URL}/`);
            const movies = response.data; 
            const rooms = await this.getAllRooms();
            console.log(`Kiểm tra: Phim: ${movies.length} | Phòng: ${rooms.length}`);
            if(!movies || movies.length === 0 || rooms.length === 0){
                console.log('HỦY TẠO LỊCH: Không có dữ liệu phim hoặc phòng.');
                return {message: 'Không có phim hoặc phòng chiếu.'};
            }
            if(typeof SHOWTIME_REPO.clearFutureShowtimes === 'function'){
                await SHOWTIME_REPO.clearFutureShowtimes(daysAhead);
                console.log("Đã dọn dẹp lịch chiếu cũ để làm mới.");
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
                            const endDateTime = new Date(startDateTime.getTime() + (totalTimeMinutes * 60 * 1000));
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
                                console.error(`Lỗi chèn xuất ${config.time}: ${error.message}`);
                                errorsLogged++;
                            }
                        }
                    }
                }
            }
            console.log(`KẾT THÚC: Đã tạo ${newShowtimesCount} suất chiếu mới.`);
            return{
                status: "success",
                message: `Đã cập nhật lịch chiếu cho ${daysAhead} ngày tới.`,
                totalCreated: newShowtimesCount,
                totalErrors: errorsLogged
            };
        }
        catch (error){
            console.error("Lỗi hệ thống khi tạo lịch:", error.message);
            throw new Error(`Không thể kết nối Catalog Service hoặc Database: ${error.message}`);
        }
    }
}