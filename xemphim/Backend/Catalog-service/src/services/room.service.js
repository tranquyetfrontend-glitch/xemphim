import {RoomRepository} from '../repositories/room.repository.js';

const ROOM_REPO = new RoomRepository();

export class RoomService{
    async getPhysicalSeats(roomId){
        if(!roomId){
            throw new Error('Room ID là bắt buộc.');
        }
        const seats = await ROOM_REPO.getPhysicalSeatByRoomId(roomId);
        if(seats.length === 0){
            return [];
        }
        return seats;
    }
}