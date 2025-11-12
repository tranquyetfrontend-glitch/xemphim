document.addEventListener("DOMContentLoaded", function(){
    const thungChuaPhim = document.getElementById("danhsachphimhan");
    if (!thungChuaPhim || !danhSachPhimHan || danhSachPhimHan.length === 0) {
        console.error("Không tìm thấy container hoặc danh sách phim trống.");
        return;
    }
    danhSachPhimHan.forEach(phim => {
        const movieItemHTML = `
            <div class="movieitem">
                <img src="${phim.hinhAnh}" alt="${phim.tieuDe}">
                <div class="overlay">
                    <span class="play-icon">▶</span> 
                </div>
                <p class="movietitle">${phim.tieuDe}</p>
                <p class="moviesubtitle">${phim.phuDe}</p>
            </div>
        `;
        thungChuaPhim.innerHTML += movieItemHTML;
    });

    const thungChuaXepHang =document.getElementById("danhSachXepHang");
    if(thungChuaXepHang && danhSachXepHang){
        danhSachXepHang.forEach(item => {
            const todayItemHTML=`
            <div class="todayitem">
                <img src="${item.hinhAnh}" alt="${item.tieuDe}">
                <div class="info">
                    <h4>${item.tieuDe}</h4>
                    <p class="subtitle">${item.phuDe}</p>
                    <div class="ratinginfo">
                        <div class="scorebox">
                            <span class="star">⭐</span>
                            <span class="score">${item.diem}</span>
                        </div>
                        <span class="year">${item.nam}</span>
                    </div>
                </div>
                <div class="rank">${item.rank}</div>
            </div>
            `;
            thungChuaXepHang.innerHTML += todayItemHTML;
        })
    }
});

