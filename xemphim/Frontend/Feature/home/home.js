// Sử dụng API_CONFIG từ config.js (phải load config.js trước)
const GATEWAY_URL = window.API_CONFIG?.GATEWAY_URL || 'http://127.0.0.1:8080/api';
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

function createShowtimeBlock(movieData, selectedDate){
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const groupedByCinema = {};
    movieData.showtimes.forEach(slot =>{
        let showTime;
        if(slot.time.includes('-') || slot.time.includes('T')){
            showTime = new Date(slot.time);
        }
        else{
            showTime = new Date(`${selectedDate}T${slot.time}:00`);
        }
        if(isNaN(showTime.getTime())) return;
        if(selectedDate === todayStr && showTime <= now) return;
        const cName = slot.cinema_name || slot.cinemaName || "Rạp Hệ Thống";
        const cAddress = slot.address ? ` - ${slot.address}` : "";
        const cinemaKey = `${cName}${cAddress}`;
        if (!groupedByCinema[cinemaKey]) {
            groupedByCinema[cinemaKey] = [];
        }
        groupedByCinema[cinemaKey].push({
            id: slot.showtime_id || slot.id,
            timeLabel: showTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            })
        });
    });
    let showtimesHtml = "";
    const cinemaKeys = Object.keys(groupedByCinema);
    if(cinemaKeys.length > 0){
        cinemaKeys.forEach(key =>{
            groupedByCinema[key].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));
            showtimesHtml += `
            <div class="cinema-item-block" style="margin-bottom: 20px;">
                <p style="color: #ffc107; font-weight: bold; font-size: 14px; margin: 15px 0 10px 0; border-left: 3px solid #ffc107; padding-left: 8px;">
                    ${key}
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${groupedByCinema[key].map(slot => `
                        <a href="../detail/chi-tiet-phim.html?id=${movieData.movie_id}&showtimeId=${slot.id}" 
                            class="time-slot-btn" 
                            style="background: #2a2a2a; color: white; border: 1px solid #444; padding: 8px 15px; border-radius: 4px; text-decoration: none; font-size: 14px; min-width: 60px; text-align: center;">
                            ${slot.timeLabel}
                        </a>
                    `).join('')}
                </div>
            </div>
            `;
        });
    }
    else{
        showtimesHtml = `<p style="color: #999; font-size: 13px; margin-top: 15px;">Hết suất chiếu cho ngày này.</p>`;
    }
    return `
    <div class="schedule-movie-item" style="display: flex; gap: 20px; background: #111; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #222; align-items: flex-start;">
        <div class="movie-poster" style="flex: 0 0 140px;">
            <img src="${movieData.poster_url}" alt="${movieData.title}" style="width: 100%; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.5);" onerror="this.src='https://via.placeholder.com/150x220'">
        </div>
        <div class="movie-content" style="flex: 1;">
            <h4 style="margin: 0 0 5px 0; color: white; font-size: 20px; font-weight: bold;">
                ${movieData.title.toUpperCase()} 
                <span style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 4px; font-size: 13px; margin-left: 10px; vertical-align: middle;">${movieData.age_rating || 'P'}</span>
            </h4>
            <p style="color: #aaa; font-size: 13px; margin-bottom: 10px;">Thời lượng: 100 phút | Việt Nam</p>
            <div class="all-cinemas-wrapper">
                ${showtimesHtml}
            </div>
        </div>
    </div>
    `;
}

document.addEventListener("DOMContentLoaded", async function(){
    const thungChuaPhim = document.getElementById("danhSachPhimHan");
    if(thungChuaPhim) {
        try{
            const response = await fetch(API_MOVIE_URL);
            if(!response.ok) throw new Error('Không thể tải danh sách phim từ API.');
            const movies = await response.json();
            if(movies.length === 0){
                thungChuaPhim.innerHTML = "<p>Chưa có phim nào đang chiếu.</p>";
            }
            else{
                const moviesForGrid = movies; 
                let allMoviesHTML = moviesForGrid.map(createMovieItemHTML).join('');
                thungChuaPhim.innerHTML = allMoviesHTML;
            }
        }
        catch(error){
            console.error("Lỗi tải phim:", error);
            thungChuaPhim.innerHTML = "<p style='color:red;'>Lỗi kết nối Server Catalog.</p>";
        }
    }
    
    // Chỉ load schedule nếu có container
    const scheduleContainer = document.getElementById('showtime-list-container');
    if(scheduleContainer) {
        const today = new Date().toISOString().split('T')[0];
        await renderSchedule(today);
        renderDateTabs();
    }
});

async function renderSchedule(date){
    const container = document.getElementById('showtime-list-container');
    if(!container) return;
    container.innerHTML = "<p style='color: #ccc; text-align: center;'>Đang tải lịch chiếu...</p>";
    try{
        const response = await fetch(`${API_SHOWTIME_URL}?date=${date}`);
        if(!response.ok) throw new Error('Không thể tải lịch chiếu từ Booking Service.');
        const showtimesGroupedByMovie = await response.json();
        if(!showtimesGroupedByMovie || showtimesGroupedByMovie.length === 0){
            container.innerHTML = "<p style='color: #ccc; text-align: center;'>Không có suất chiếu vào ngày này.</p>";
            return;
        }
        let htmlContent = '';
        showtimesGroupedByMovie.forEach(group =>{
            htmlContent += createShowtimeBlock(group, date);
        });
        container.innerHTML = htmlContent;
    } catch(error) {
        console.error("Lỗi tải lịch chiếu:", error);
        container.innerHTML = `<p style='color:red; text-align: center;'>Lỗi: ${error.message}</p>`;
    }
}

function renderDateTabs(){
    const selector = document.getElementById('date-selector');
    if(!selector) return;

    selector.innerHTML = '';
    const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    for(let i = 0; i < 7; i++){
        const d = new Date();
        d.setDate(d.getDate() + i);
        
        const dateString = d.toISOString().split('T')[0];
        const dayLabel = i === 0 ? "Hôm nay" : daysOfWeek[d.getDay()];
        const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;

        const tab = document.createElement('div');
        tab.className = `date-tab ${i === 0 ? 'active' : ''}`;
        tab.dataset.date = dateString;
        tab.innerHTML = `${dayLabel}, ${displayDate}`;

        tab.addEventListener('click', async function(){
            document.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            await renderSchedule(this.dataset.date);
        });

        selector.appendChild(tab);
        if(i === 0) renderSchedule(dateString); // Tải lịch chiếu ngày đầu tiên mặc định
    }
}