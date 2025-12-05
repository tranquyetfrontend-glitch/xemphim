import express from 'express';
import {getAllMovies, getMovieDetail} from '../controllers/movie.controller.js';
import {SchedulerController} from '../../booking/controllers/scheduler.controller.js';

const router = express.Router();
const app = express();
const SCHEDULER_CONTROLLER = new SchedulerController();
router.get('/', getAllMovies); 
router.get('/:id', getMovieDetail); 
app.get('/api/scheduler/generate', SCHEDULER_CONTROLLER.generateShowtimes);
export default router;