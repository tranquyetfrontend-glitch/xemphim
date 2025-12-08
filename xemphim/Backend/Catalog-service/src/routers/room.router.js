import express from 'express';
import { RoomController } from '../controllers/room.controller.js';

const router = express.Router();
const ROOM_CONTROLLER = new RoomController();

router.get(
    '/:roomId/seats', 
    ROOM_CONTROLLER.getPhysicalSeats
);

export default router;