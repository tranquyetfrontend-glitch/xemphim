import { RoomService } from "../services/room.service.js";

const ROOM_SERVICE = new RoomService();

export class RoomController{
    async getPhysicalSeats(req, res){
        try{
            const roomId = req.params.roomId;
            const seats = await ROOM_SERVICE.getPhysicalSeats(roomId);
            return res.status(200).json(seats);
        }
        catch(error){
            console.error('Lỗi tại RoomController (getPhysicalSeats):', error);
            return res.status(500).json({error: 'Không thể lấy sơ đồ ghế: ' + error.message});
        }
    }
}