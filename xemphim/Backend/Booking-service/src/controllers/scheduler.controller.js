import {SchedulerService} from '../services/scheduler.service.js';
import {ShowtimeService} from '../services/showtime.service.js';

const SCHEDULER_SERVICE = new SchedulerService();
const SHOWTIME_SERVICE = new ShowtimeService();

export class SchedulerController{
    async generateShowtimes(req, res){  
        try{
            const days = req.query.days || 7; 
            const result = await SCHEDULER_SERVICE.generateShowtimes(parseInt(days));
            return res.status(200).json(result);
        }
        catch(error){
            console.error('Lỗi tại SchedulerController:', error);
            return res.status(500).json({ error: 'Không thể chạy lập lịch tự động: '+ error.message });
        }
    }
}