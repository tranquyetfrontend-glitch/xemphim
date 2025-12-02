import express from 'express';
import {getAllMovies, getMovieDetail} from '../controllers/movie.controller.js';

const router = express.Router();
router.get('/', getAllMovies); 
router.get('/:id', getMovieDetail); 

export default router;