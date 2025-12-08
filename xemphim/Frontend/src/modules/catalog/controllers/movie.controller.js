import {MovieService} from '../services/movie.service.js';

const MOVIE_SERVICE = new MovieService();
export const getAllMovies = async (req,res)=>{
    try{
        const movies = await MOVIE_SERVICE.getMovieList();
        return res.status(200).json(movies);
    }
    catch(error){
        console.error("Lỗi Controller lấy danh sách phim:", error.message);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
};

export const getMovieDetail = async (req,res)=>{
    try{
        const movieId = req.params.id;
        if(!movieId){
            return res.status(400).json({ message: 'Thiếu ID phim.' });
        }
        const details = await MOVIE_SERVICE.getMovieDetail(movieId);
        return res.status(200).json(details);
    }
    catch(error){
        console.error("Lỗi Controller lấy chi tiết phim:", error.message);
        let status = 500;
        if(error.message.includes('không tồn tại')){
            status = 404;
        }
        return res.status(status).json({ message: error.message });
    }
};