document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const container = document.getElementById("movie-detail-container");
    if(movieId){
        const allMovies = [...danhSachPhimHan, ...danhSachXepHang];
        const phim = allMovies.find(p=> p.id === movieId);
        if(phim){
            const bgContainer = document.querySelector('.detail-background');
            if(bgContainer){
                bgContainer.style.setProperty('--detail-bg-image', `url(${phim.hinhAnh})`);
            }
            document.title = phim.tieuDe;
            const detailHTML = `
            <div class="detail-layout">
                <div class="detail-poster">
                    <img src="${phim.hinhAnh}" alt="${phim.tieuDe}">
                </div>
                <div class="detail-info">
                    <h1>${phim.tieuDe}</h1>
                    <p><strong>Thời Lượng:</strong>${phim.thoiLuong}</p>
                    <p><strong>Đạo Diễn:</strong>${phim.daoDien}</p>
                    <p><strong>Diễn Viên:</strong>${phim.dienVien}</p>
                    <p><strong>Khởi Chiếu:</strong>${phim.khoiChieu}</p>
                    <div class="synopsis">
                        <p>${phim.moTa}</p>
                    </div>
                    <div class="detail-buttons">
                        <a href="#" class="btn btn-primary">Chi tiết nội dung</a>
                        <a href="#" class="btn btn-secondary">Xem trailer</a>
                    </div>
                 </div>
            </div>

            <div class="showtime-section">
                <div class="showtime-dates">
                <div class="date-item active" data-date="13">
                    <span class="day-of-week">Th. 11</span>
                    <span class="day-num">13</span>
                    <span class="day-name">Thứ năm</span>
                </div>
                <div class="date-item" data-date="14"> 
                    <span class="day-of-week">Th. 11</span>
                    <span class="day-num">14</span>
                    <span class="day-name">Thứ sáu</span>
                </div>
                <div class="date-item" data-date="15"> 
                    <span class="day-of-week">Th. 11</span>
                    <span class="day-num">15</span>
                    <span class="day-name">Thứ bảy</span>
                </div>
                </div>

                <div id="time-slots-container" class="time-slots-container">
                    <a href="#" class="time-slot-btn">18:20</a>
                    <a href="#" class="time-slot-btn">20:00</a>
                    <a href="#" class="time-slot-btn">21:05</a>
                </div>
            </div>
            <div class="intermediate-footer">
                <a href="#">Chính sách</a>
                <a href="#">Lịch chiếu</a>
                <a href="#">Tin tức</a>
                <a href="#">Giá vé</a>
                <a href="#">Hỏi đáp</a>
                <a href="#">Đặt vé nhóm, tập thể</a>
                <a href="#">Liên hệ</a>
            </div>

            <div class="copyright-section">
            <div class="social-icons">
                <a href="#"><img src="picture/fb.jpg" alt="Facebook"></a>
                <a href="#"><img src="picture/zl.png" alt="Zalo"></a>
                <a href="#"><img src="picture/yt.png" alt="Youtube"></a>
                <a href="#"><img src="picture/gg.png" alt="Google Play"></a>
                <a href="#"><img src="picture/appstore.png" alt="App Store"></a>
                 </div>
            <div class="contact-info">
                <p>Cơ quan chủ quản: BỘ VĂN HÓA, THỂ THAO VÀ DU LỊCH</p>
                <p>Bản quyền thuộc Trung tâm Chiếu phim Quốc gia.</p>
                <p>Giấy phép số: 224/GP- TTĐT ngày 31/8/2010 - Chịu trách nhiệm: Vũ Đức Tùng – Giám đốc.</p>
                <p>Địa chỉ: Số 87 Láng Hạ, Phường Ô Chợ Dừa, TP.Hà Nội - Điện thoại: 024.35141791</p>
            </div>
                <p class="copyright">Copyright 2023. NCC All Rights Reserved. Dev by Anvui.vn</p>
            </div>
            `;

            container.innerHTML = detailHTML;
            const dateItems = document.querySelectorAll('.date-item');
            const timeSlotsContainer = document.getElementById('time-slots-container');
            const showtimesData = {
                '13': ['18:20', '20:00', '21:05'],
                '14': ['19:00', '21:00', '22:55'],
                '15': ['15:00', '18:30', '20:30']
            };
            function updateShowtimes(dateId){
                const time = showtimesData[dateId] || [];
                let timesHTML = '';
                if(time.length>0){
                    time.forEach(time=>{
                        timesHTML += `<a href="#" class="time-slot-btn">${time}</a>`;
                    });
                }
                else{
                    timesHTML =`<p style="color: #ccc; margin-left: 15px;">Chưa có suất chiếu cho ngày này.</p>`;
                }
                timeSlotsContainer.innerHTML = timesHTML;
            }
            dateItems.forEach(item=>{
                item.addEventListener('click',function(){
                    dateItems.forEach(d=> d.classList.remove('active'));
                    this.classList.add('active');
                    const selectedDateId = this.getAttribute('data-date');
                    updateShowtimes(selectedDateId);
                });
            });
            const defaultActiveDate = document.querySelector('.date-item.active');
            if(defaultActiveDate){
                updateShowtimes(defaultActiveDate.getAttribute('data-date'));
            }
        }
        else{
            container.innerHTML = "<h1>Không tìm thấy phim này.</h1>";
        }
    }
    else{
        container.innerHTML = "<h1>Lỗi: Không có ID phim.</h1>";
    }
});