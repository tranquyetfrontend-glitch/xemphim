document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const container = document.getElementById("moviedetailcontainer");
    if(movieId){
        const allMovies = [...danhSachPhimHan, ...danhSachXepHang];
        const phim = allMovies.find(p=> p.id === movieId);
        if(phim){
            document.title = phim.tieuDe;
            const detailHTML = `
            <div class="detaillayout">
                <div class="detailposter">
                    <img src="${phim.hinhAnh}" alt="${phim.tieuDe}">
                </div>
                <div class="detailinfo">
                    <h1>${phim.tieuDe}</h1>
                    <p><strong>Thời Lượng:</strong>${phim.thoiLuong}</p>
                    <p><strong>Đạo Diễn</strong>${phim.daoDien}</p>
                    <p><strong>Diễn Viên</strong>${phim.dienVien}</p>
                    <p><strong>Khởi Chiếu</strong>${phim.khoiChieu}</p>
                    <div class="synopsis">
                        <p>${phim.moTa}</p>
                    </div>
                    <div class="detailbuttons">
                        <a href="#" class="btnbtnprimary">Chi tiết nội dung</a>
                        <a href="#" class="btnbtnsecondary">Xem trailer</a>
                    </div>
                 </div>
            </div>
            `;
            container.innerHTML = detailHTML;
        }
        else{
            container.innerHTML = "<h1>Không tìm thấy phim này.</h1>";
        }
    }
    else{
        container.innerHTML = "<h1>Lỗi: Không có ID phim.</h1>";
    }
});