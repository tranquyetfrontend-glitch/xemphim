document.addEventListener("DOMContentLoaded", function(){
    const thungChuaPhim = document.getElementById("danhSachPhimHan");
    if (!thungChuaPhim || !danhSachPhimHan || danhSachPhimHan.length === 0) {
        console.error("Không tìm thấy container hoặc danh sách phim trống.");
        return;
    }
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
        thungChuaPhim.innerHTML += movieItemHTML;
    });

    const thungChuaXepHang =document.getElementById("danhSachXepHang");
    if(thungChuaXepHang && danhSachXepHang){
        danhSachXepHang.forEach(item => {
            const todayItemHTML=`
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
            thungChuaXepHang.innerHTML += todayItemHTML;
        })
    }
});