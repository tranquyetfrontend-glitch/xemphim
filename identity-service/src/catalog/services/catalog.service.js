import {MovieRepository} from '../repositories/movie.repository.js';

const MOVIE_REPO = new MovieRepository();

export class CatalogService {
    async getNowShowingMovies(){
        const movies = await MOVIE_REPO.findNowShowingMovies();
        if(!movies || movies.length === 0){
            return [];
        }
        return movies;
    }
}