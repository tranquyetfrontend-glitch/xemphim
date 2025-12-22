const GATEWAY_URL = 'http://127.0.0.1:8080/api';
const API_MOVIE_URL = `${GATEWAY_URL}/catalog/movies`;
const API_SHOWTIME_URL = `${GATEWAY_URL}/bookings/showtimes/schedule`;

function createMovieItemHTML(movie){
    return `
    <a href="../detail/chi-tiet-phim.html?id=${movie.movie_id}">
        <div class="movie-item">
            <img src="${movie.poster_url}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450'">
            <div class="overlay">
                <span class="play-icon">▶</span> 
            </div>
            <p class="movie-title">${movie.title}</p>
            <p class="movie-subtitle">${movie.subtitle || 'Phụ đề'}</p>
        </div>
    </a>
    `;
}

function createRankingItemHTML(movie, index){
    const rank = index + 1;
    const score = (Math.random() * (9.5 - 7.0) + 7.0).toFixed(1); 
    const year = new Date(movie.release_date).getFullYear();
    return `
    <a href="../detail/chi-tiet-phim.html?id=${movie.movie_id}">
        <div class="today-item">
            <img src="${movie.poster_url}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/100x150'">
            <div class="info">
                <h4>${movie.title}</h4>
                <p class="sub-title">${movie.subtitle || 'Phụ đề'}</p>
                <div class="rating-info">
                    <div class="score-box">
                        <span class="star">⭐</span>
                        <span class="score">${score}</span>
                    </div>
                    <span class="year">${year}</span>
                </div>
            </div>
            <div class="rank">${rank}</div>
        </div>
    </a>
    `;
}

function createShowtimeBlock(movie, showtimeData){
    const timesHtml = showtimeData.map(slot =>{
        const timeObj = new Date(slot.time);
        const timeStr = timeObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
        return `<a href="../detail/chi-tiet-phim.html?id=${movie.movie_id}&time=${timeStr}" class="time-slot-btn">${timeStr}</a>`;
    }).join('');
    return `
    <div class="schedule-movie-item">
        <img src="${movie.poster_url}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/100x150'">
        <div class="movie-info">
            <h4><a href="../detail/chi-tiet-phim.html?id=${movie.movie_id}">${movie.title}</a></h4>
            <p class="subtitle">${movie.subtitle || 'Phụ đề'}</p>
            <div class="showtime-times">
                ${timesHtml}
            </div>
        </div>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", async function(){
    const thungChuaPhim = document.getElementById("danhSachPhimHan");
    const thungChuaXepHang = document.getElementById("danhSachXepHang");
    if(thungChuaPhim && thungChuaXepHang) {
        try{
            const response = await fetch(API_MOVIE_URL);
            if(!response.ok) throw new Error('Không thể tải danh sách phim từ API.');
            const movies = await response.json();
            if(movies.length === 0){
                thungChuaPhim.innerHTML = "<p>Chưa có phim nào đang chiếu.</p>";
                thungChuaXepHang.innerHTML = "<p>Chưa có phim xếp hạng.</p>";
            }
            else{
                const moviesForGrid = movies; 
                let allMoviesHTML = moviesForGrid.map(createMovieItemHTML).join('');
                thungChuaPhim.innerHTML = allMoviesHTML;
                const rankedMovies = movies.slice(0, 7); 
                let allRankingsHTML = rankedMovies.map(createRankingItemHTML).join('');
                thungChuaXepHang.innerHTML = allRankingsHTML;
            }
        }
        catch(error){
            console.error("Lỗi tải phim:", error);
            thungChuaPhim.innerHTML = "<p style='color:red;'>Lỗi kết nối Server Catalog.</p>";
            thungChuaXepHang.innerHTML = "<p style='color:red;'>Lỗi kết nối Server Catalog.</p>";
        }
    }
    const today = new Date().toISOString().split('T')[0];
    await renderSchedule(today);
});

async function renderSchedule(date){
    const container = document.getElementById('showtime-list-container');
    if(!container) return;
    container.innerHTML = "<p style='color: #ccc; text-align: center;'>Đang tải lịch chiếu...</p>";
    try{
        const response = await fetch(`${API_SHOWTIME_URL}?date=${date}`);
        if(!response.ok) throw new Error('Không thể tải lịch chiếu từ Booking Service.');
        const showtimesGroupedByMovie = await response.json();
        if(showtimesGroupedByMovie.length === 0){
            container.innerHTML = "<p style='color: #ccc; text-align: center;'>Không có suất chiếu vào ngày này.</p>";
            return;
        }
        let htmlContent = '';
        showtimesGroupedByMovie.forEach(group => {
            htmlContent += createShowtimeBlock(group, group.showtimes); 
        });
        container.innerHTML = htmlContent;
    }
    catch(error){
        console.error("Lỗi tải lịch chiếu:", error);
        container.innerHTML = "<p style='color:red; text-align: center;'>Lỗi tải lịch chiếu. Vui lòng kiểm tra Server Booking.</p>";
    }
}