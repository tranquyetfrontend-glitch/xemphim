document.addEventListener("DOMContentLoaded", function(){
    const thungChuaPhim = document.getElementById("danhSachPhimHan");
    if (thungChuaPhim && danhSachPhimHan && danhSachPhimHan.length > 0){
        let allMoviesHTML = ''; 
        danhSachPhimHan.forEach(phim => {
            const movieItemHTML = `
            <a href="../detail/chi-tiet-phim.html?id=${phim.id}">
                <div class="movie-item">
                    <img src="${phim.hinhAnh}" alt="${phim.tieuDe}">
                    <div class="overlay">
                        <span class="play-icon">▶</span> 
                    </div>
                    <p class="movie-title">${phim.tieuDe}</p>
                    <p class="movie-subtitle">${phim.phuDe}</p>
                </div>
            </a>
            `;
            allMoviesHTML += movieItemHTML;
        });
        thungChuaPhim.innerHTML = allMoviesHTML;
    } 

    const thungChuaXepHang = document.getElementById("danhSachXepHang");
    if(thungChuaXepHang && danhSachXepHang && danhSachXepHang.length > 0){
        let allRankingsHTML = '';
        danhSachXepHang.forEach(item => {
            const todayItemHTML = `
            <a href="../detail/chi-tiet-phim.html?id=${item.id}">
            <div class="today-item">
                <img src="${item.hinhAnh}" alt="${item.tieuDe}">
                <div class="info">
                    <h4>${item.tieuDe}</h4>
                    <p class="sub-title">${item.phuDe}</p>
                    <div class="rating-info">
                        <div class="score-box">
                            <span class="star">⭐</span>
                            <span class="score">${item.diem}</span>
                        </div>
                        <span class="year">${item.nam}</span>
                    </div>
                </div>
                <div class="rank">${item.rank}</div>
            </div>
            </a>
            `;
            allRankingsHTML += todayItemHTML;
        });
        thungChuaXepHang.innerHTML = allRankingsHTML;
    }
});

function createShowtimeBlock(movie, date) {
    const showtimes = [
        "09:30", "11:30", "14:00", "18:30", "22:00"
    ]; 
    const movieSpecificShowtimes = {
        "Anh Trai Say Xe": ["18:35", "21:00", "22:20", "23:00"],
        "Sao Tháng 8": ["10:00"],
        "Vợ Chồng A Phủ": ["14:00"],
        "Chủ Thuật Hồi Chiến 0": ["11:50"],
        "Trùm Thủy Long Ngâm": ["10:00", "14:00"],
        "Chim Vành Khuyên": ["20:00"],
        [movie.tieuDe]: ["09:30", "11:30", "14:00", "18:30", "22:00"]
    };

    const currentShowtimes = movieSpecificShowtimes[movie.title] || showtimes;
    const timeSlotsHTML = currentShowtimes.map(time => {
        const statusClass = "available";
        return `<a href="#" class="time-slot ${statusClass}">${time}</a>`;
    }).join('');
    const ratingClass = 't13';
    const ratingText = '13+';
    return `
        <div class="movie-showtime-block">
            <div class="movie-info">
                <div class="left-poster">
                    <img src="${movie.hinhAnh}" alt="${movie.tieuDe}">
                </div>
                <div class="right-details">
                    <h3>${movie.tieuDe}</h3>
                    <p class="movie-meta">
                        <span class="rating ${ratingClass}">${ratingText}</span>
                        <span>|</span>
                        <span class="type">${movie.thoiLuong}</span>
                    </p>
                    <p class="movie-meta">Xuất xứ: Hàn Quốc </p>
                    <p class="movie-meta">Khởi chiếu: ${movie.khoiChieu}</p>
                    <p class="movie-meta">Dành cho người trên 13 tuổi. </p>
                    <p class="movie-meta showtime-title">Lịch chiếu:</p>
                    <div class="showtime-grid">${timeSlotsHTML}</div>
                </div>
            </div>
        </div>
    `;
}

function renderSchedule(date = "2025-11-19") {
    const container = document.getElementById('showtime-list-container');
    if (!container) return;
    if (typeof danhSachPhimHan === 'undefined' || !danhSachPhimHan || danhSachPhimHan.length === 0) {
        container.innerHTML = "<p style='color: #ccc; text-align: center;'>Không có dữ liệu phim.</p>";
        return;
    }
    let htmlContent = '';
    danhSachPhimHan.forEach(movie => { 
        htmlContent += createShowtimeBlock(movie, date);
    });

    container.innerHTML = htmlContent;
}

document.addEventListener('DOMContentLoaded', () => {
    renderSchedule();
    const dateTabs = document.querySelectorAll('.date-tab');
    dateTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            dateTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderSchedule(this.getAttribute('data-date'));
        });
    });
});