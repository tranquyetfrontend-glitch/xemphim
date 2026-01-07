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

    (movieData.showtimes || []).forEach(slot =>{
        let showTime;
        if(slot.time && (slot.time.includes('-') || slot.time.includes('T'))){
            showTime = new Date(slot.time);
        }
        else if(slot.time){
            showTime = new Date(`${selectedDate}T${slot.time}:00`);
        }
        if(!showTime || isNaN(showTime.getTime())) return;
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

    if (cinemaKeys.length > 0) {
        const firstCinemaKey = cinemaKeys[0];
        groupedByCinema[firstCinemaKey].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));

        showtimesHtml += `
        <div class="cinema-item-block">
            <p class="cinema-name-label">
                ${firstCinemaKey}
            </p>
            <div class="showtime-grid">
                ${groupedByCinema[firstCinemaKey].map(slot => `
                    <a href="../detail/chi-tiet-phim.html?id=${movieData.movie_id}&showtimeId=${slot.id}" 
                        class="time-slot-btn">
                        ${slot.timeLabel}
                    </a>
                `).join('')}
            </div>
        </div>
        `;
    } else {
        showtimesHtml = `<p class="no-showtime-text">Hết suất chiếu cho ngày này.</p>`;
    }

    return `
    <div class="schedule-movie-item">
        <div class="schedule-poster">
            <img src="${movieData.poster_url}" alt="${movieData.title}" onerror="this.src='https://via.placeholder.com/150x220'">
        </div>
        <div class="schedule-content">
            <div class="schedule-title-row">
                <h4 class="schedule-title">${movieData.title}</h4>
                <span class="age-badge">${movieData.age_rating || 'P'}</span>
            </div>
            <p class="schedule-meta">Thời lượng: ${movieData.duration || 100} phút | ${movieData.country || 'Việt Nam'}</p>
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

    for(let i = 0; i < 3; i++){
        const d = new Date();
        d.setDate(d.getDate() + i);
        
        const dateString = d.toISOString().split('T')[0];
        const dayLabel = daysOfWeek[d.getDay()];
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
        if(i === 0) renderSchedule(dateString);
    }
}