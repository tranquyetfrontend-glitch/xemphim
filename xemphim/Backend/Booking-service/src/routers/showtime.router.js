import express from 'express';
import {ShowtimeController} from '../controllers/showtime.controller.js'; 

const router = express.Router();
const SHOWTIME_CONTROLLER = new ShowtimeController();

router.get(
    '/grouped-by-movie/:movieId',
    SHOWTIME_CONTROLLER.getGroupedShowtimesByMovieId.bind(SHOWTIME_CONTROLLER) 
);
router.get(
    '/:showtimeId/seats',
    SHOWTIME_CONTROLLER.getSeatAvailability.bind(SHOWTIME_CONTROLLER)
);

export default router;