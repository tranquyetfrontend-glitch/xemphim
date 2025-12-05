import express from 'express';
import {ShowtimeController} from '../controllers/showtime.controller.js'; 

const router = express.Router();
const SHOWTIME_CONTROLLER = new ShowtimeController();

router.get(
    '/grouped-by-movie/:movieId', 
    SHOWTIME_CONTROLLER.getGroupedShowtimesByMovieId
);
router.get(
    '/:showtimeId/seats',
    SHOWTIME_CONTROLLER.getSeatAvailability
);

export default router;