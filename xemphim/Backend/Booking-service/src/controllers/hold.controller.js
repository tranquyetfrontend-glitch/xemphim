import { HoldService } from '../services/hold.service.js';

const HOLD_SERVICE = new HoldService();

export class HoldController{
    async holdSeats(req, res){
        try{
            const {showtime_id, user_id, seat_ids} = req.body; 
            const parsedShowtimeId = parseInt(showtime_id, 10);
            if(!parsedShowtimeId || !user_id || !seat_ids || seat_ids.length === 0){
                return res.status(400).json({ error: 'Thiếu thông tin suất chiếu, người dùng hoặc ghế.' });
            }
            const holdData = await HOLD_SERVICE.processHold(parsedShowtimeId, user_id, seat_ids);
            return res.status(200).json(holdData);
        }
        catch(error){
            console.error('Lỗi tại HoldController (holdSeats):', error);
            return res.status(409).json({ error: 'Không thể giữ ghế: ' + error.message });
        }
    }
}