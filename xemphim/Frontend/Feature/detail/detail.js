const GATEWAY_URL = 'http://127.0.0.1:8080/api';
const API_MOVIE_URL = `${GATEWAY_URL}/catalog/movies`;
const API_SHOWTIME_URL = `${GATEWAY_URL}/bookings/showtimes/schedule`;

let countdownInterval;
let selectedSeats = [];
const SEAT_PRICE = 80000;
const VIP_PRICE = 100000;
const COUPLE_PRICE = 180000;
let currentMovie = {};
let currentSelectedTime = "";
let currentShowtimeDetails = {};

//HÀM startCountdown
function startCountdown(durationSeconds){
    let timer = durationSeconds, minutes, seconds;
    if(countdownInterval) clearInterval(countdownInterval);
    const displayElement = document.getElementById('countdown');
    if(!displayElement) return;
    countdownInterval = setInterval(()=>{
        minutes = parseInt(timer / 60,10);
        seconds = parseInt(timer % 60,10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        displayElement.textContent = minutes + ":" + seconds;
        if(--timer < 0){
            clearInterval(countdownInterval);
            alert("Đã hết thời gian chọn ghế. Vui lòng thử lại!"); 
            window.location.reload();
        }
    },1000);
}

//HÀM CLICK GHẾ
function handleSeatClick(event) {
    const seat = event.target;
    const seatId = seat.dataset.id;
    const seatType = seat.dataset.type;
    if(seat.classList.contains('selected')){
        seat.classList.remove("selected");
        selectedSeats = selectedSeats.filter(id => id !== seatId);
        console.log(`Đã bỏ chọn ghế loại: ${seatType}`); 
    }
    else{
        if(selectedSeats.length >= 8){
            alert("Bạn chỉ được chọn tối đa 8 ghế");
            return;
        }
        seat.classList.add('selected');
        selectedSeats.push(seatId);
        console.log(`Đã chọn ghế loại: ${seatType}`);
    }
    updateSelectionSummary();
}

//HÀM TÍNH TIỀN
function updateSelectionSummary(returnTotal = false){
    const seatDisplay = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('total-price-display');
    if(selectedSeats.length === 0){
        if(!returnTotal){
            seatDisplay.textContent = '...';
            priceDisplay.textContent = '0đ';
        }
        return 0;
    }
    let total = 0;
    selectedSeats.forEach(seatId =>{
        const seatEl = document.querySelector(`[data-id="${seatId}"]`);
        const type = seatEl ? seatEl.dataset.type : 'STANDARD';
        if (type === 'VIP') total += VIP_PRICE;
        else if (type === 'COUPLE') total += (COUPLE_PRICE / 2);
        else total += SEAT_PRICE;
    });
    if(!returnTotal){
        seatDisplay.textContent = [...selectedSeats].sort().join(', ');
        priceDisplay.textContent = `${total.toLocaleString('vi-VN')}đ`;
    }
    return total;
}

//HÀM THANH TOÁN
async function handleCheckout() {
    if(selectedSeats.length === 0){
        alert('Vui lòng chọn ít nhất một ghế');
        return;
    }
    const total = updateSelectionSummary(true);
    try{
        const response = await fetch(`${GATEWAY_URL}/bookings/bookings/hold-seats`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                showtime_id: currentShowtimeDetails.showtime_id,
                user_id: 1,
                seat_ids: selectedSeats
            })
        });
        const result = await response.json();
        if(response.ok){
            localStorage.setItem('paymentData', JSON.stringify({
                showtimeId: currentShowtimeDetails.showtime_id,
                movieTitle: currentMovie.title,
                seats: selectedSeats,
                total: total,
                holdExpiresAt: result.hold_expires_at
            }));
            window.location.href = '../payment/thanh-toan.html';
        }
        else{
            alert(result.message || "Ghế đã có người khác nhanh tay chọn trước!");
            window.location.reload();
        }
    }
    catch(error){
        alert("Lỗi kết nối Server Booking.");
    }
}

async function fetchSeatMap(showtimeId){
    try{
        const response = await fetch(`${GATEWAY_URL}/bookings/showtimes/${showtimeId}/seats`);
        if(!response.ok) throw new Error("404");
        return await response.json();
    }
    catch(error){
        console.error("Lỗi API Ghế", error);
        return null;
    }
}

async function renderSeatSelection(movie, selectedShowtime){
    const seatData = await fetchSeatMap(selectedShowtime.showtime_id);
    if(!seatData){
        alert("Suất chiếu này hiện chưa có sơ đồ ghế.");
        return;
    }
    const showtimeSection = document.querySelector('.showtime-section');
    if(!showtimeSection) return;
    currentMovie = movie;
    currentShowtimeDetails = selectedShowtime; 
    selectedSeats = [];
    const timeStr = new Date(selectedShowtime.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    showtimeSection.innerHTML = `
    <div class="seat-selection-content">
        <div class="showtime-header">
            <span class="movie-title-display">${movie.title}</span>
            <span class="showtime-display">Giờ chiếu: ${timeStr}</span>
            <span class="timer-display">Hết hạn sau: <span id="countdown">10:00</span></span>
        </div>
        <div class="screen-area">
            <div class="screen-indicator">MÀN HÌNH</div>
            <div class="screen-line"></div>
        </div>
        <div class="seating-chart">
            <div id="seat-map-grid"></div>
        </div>
        <div class="legend-and-payment">
            <div class="seat-legend">
                <span class="legend-item"><span class="seat-example reserved"></span>Đã đặt</span>
                <span class="legend-item"><span class="seat-example selected"></span>Đang chọn</span>
                <span class="legend-item"><span class="seat-example available"></span>Thường</span>
                <span class="legend-item"><span class="seat-example vip"></span>VIP</span>
                <span class="legend-item"><span class="seat-example couple"></span>Đôi</span>
            </div>
            <div class="payment-summary">
                <p>Ghế: <span id="selected-seats-display">...</span></p>
                <p>Tổng: <span id="total-price-display">0đ</span></p>
                <div class="action-buttons">
                    <button id="cancel-selection-btn" class="btn btn-secondary">Quay lại</button>
                    <button id="checkout-btn" class="btn btn-primary">Thanh toán ngay</button>
                </div>
            </div>
        </div>
    </div>
    `;
    initializeSeatMapFromAPI(seatData.seat_map);
    startCountdown(600);
    document.getElementById('cancel-selection-btn').onclick = () => window.location.reload();
    document.getElementById('checkout-btn').onclick = handleCheckout;
}

function initializeSeatMapFromAPI(seatMap){
    const seatMapGrid = document.getElementById('seat-map-grid');
    if(!seatMapGrid) return;
    const rows = {};
    seatMap.forEach(seat =>{
        if(!rows[seat.row_label]) rows[seat.row_label] = [];
        rows[seat.row_label].push(seat);
    });
    Object.keys(rows).sort().forEach(rowLabel =>{
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        rowDiv.innerHTML = `<span class="row-label">${rowLabel}</span>`;
        rows[rowLabel].forEach(seatData =>{
            const seat = document.createElement('div');
            seat.className = `seat ${seatData.status.toLowerCase()} ${seatData.type.toLowerCase()}`;
            seat.dataset.id = seatData.seat_id;
            seat.dataset.type = seatData.type;
            seat.textContent = seatData.seat_number;
            if(seatData.status === 'AVAILABLE'){
                seat.onclick = handleSeatClick;
            }
            rowDiv.appendChild(seat);
        });
        seatMapGrid.appendChild(rowDiv);
    });
}

function renderMovieDetail(phim, container){
    document.title = phim.title || "Chi tiết phim";
    container.innerHTML = `
    <div class="detail-layout">
        <div class="detail-poster">
            <img src="${phim.poster_url}" alt="${phim.title}">
        </div>
        <div class="detail-info">
            <h1>${phim.title}</h1>
            <p><strong>Thời Lượng:</strong> ${phim.duration_minutes} phút</p>
            <p>${phim.description || 'Chưa có mô tả.'}</p>
        </div>
    </div>
    <div class="showtime-section">
        <div id="date-list" class="showtime-dates"></div>
        <div id="time-slots-container" class="time-slots-container"></div>
    </div>
    `;
}

function renderDateSelector(phim){
    const dateListContainer = document.getElementById('date-list');
    const today = new Date();
    let datesHTML = '';
    for(let i = 0; i < 3; i++){
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayNum = date.getDate();
        const month = date.getMonth() + 1;
        const dayName = i === 0 ? "Hôm nay" : `Thứ ${date.getDay() + 1 === 1 ? 'CN' : date.getDay() + 1}`;
        const dateString = date.toISOString().split('T')[0];
        datesHTML += `
        <div class="date-item ${i === 0 ? 'active' : ''}" data-date="${dateString}">
            <span class="day-of-week">Th.${month}</span>
            <span class="day-num">${dayNum}</span>
            <span class="day-name">${dayName}</span>
        </div>
        `;
    }
    dateListContainer.innerHTML = datesHTML;
    const dateItems = document.querySelectorAll('.date-item');
    dateItems.forEach(item =>{
        item.onclick = function(){
            dateItems.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            renderTimesByDate(phim, this.dataset.date);
        };
    });
    renderTimesByDate(phim, today.toISOString().split('T')[0]);
}

function renderTimesByDate(phim, selectedDate){
    const timeSlotsContainer = document.getElementById('time-slots-container');
    timeSlotsContainer.innerHTML = '';
    if(!phim.showtimes || phim.showtimes.length === 0){
        timeSlotsContainer.innerHTML = '<p style="color:#999; text-align:center;">Chưa có lịch chiếu.</p>';
        return;
    }
    let foundAny = false;
    phim.showtimes.forEach(cinema =>{
        const validTimes = cinema.times.filter(t => t.time.startsWith(selectedDate));
        if(validTimes.length > 0){
            foundAny = true;
            const cinemaDiv = document.createElement('div');
            cinemaDiv.className = 'cinema-group';
            cinemaDiv.innerHTML = `<h4 class="cinema-name-title">${cinema.cinemaName} - ${cinema.address}</h4>`;
            const timesDiv = document.createElement('div');
            timesDiv.className = 'cinema-times';
            validTimes.forEach(slot =>{
                const timeStr = new Date(slot.time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                const btn = document.createElement('button');
                btn.className = 'time-slot-btn';
                btn.textContent = timeStr;
                btn.onclick = () => renderSeatSelection(phim, slot);
                timesDiv.appendChild(btn);
            });
            cinemaDiv.appendChild(timesDiv);
            timeSlotsContainer.appendChild(cinemaDiv);
        }
    });
    if(!foundAny){
        timeSlotsContainer.innerHTML = '<p style="color:#999; text-align:center;">Không có suất chiếu vào ngày này.</p>';
    }
}

document.addEventListener("DOMContentLoaded", async function(){
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const container = document.getElementById("movie-detail-container");
    if(!movieId){
        container.innerHTML = "<h1 style='color:white; text-align:center;'>Lỗi: Không tìm thấy ID phim.</h1>";
        return;
    }
    try{
        const response = await fetch(`http://127.0.0.1:3002/api/movies/${movieId}`);
        if(!response.ok) throw new Error('Không thể tải thông tin phim.');
        const phim = await response.json();
        const bgContainer = document.querySelector('.detail-background');
        if(bgContainer){
            bgContainer.style.setProperty('--detail-bg-image', `url(${phim.poster_url})`);
        }
        document.title = phim.title;
        const detailHTML = `
        <div class="detail-layout">
            <div class="detail-poster">
                <img src="${phim.poster_url}" alt="${phim.title}" onerror="this.src='https://via.placeholder.com/300x450'">
            </div>
            <div class="detail-info">
                <h1>${phim.title}</h1>
                <p><strong>Thời Lượng:</strong> ${phim.duration_minutes} phút</p>
                <p><strong>Khởi Chiếu:</strong> ${new Date(phim.release_date).toLocaleDateString('vi-VN')}</p>
                <div class="synopsis">
                    <p>${phim.description || 'Chưa có mô tả nội dung cho phim này.'}</p>
                </div>
                <div class="detail-buttons">
                    <button class="btn btn-primary">Chi tiết nội dung</button>
                    ${phim.trailer_url ? `<a href="${phim.trailer_url}" target="_blank" class="btn btn-secondary">Xem trailer</a>` : ''}
                </div>
            </div>
        </div>
        <div class="showtime-section">
            <h3 class="section-title">LỊCH CHIẾU</h3>
            <div class="showtime-dates" id="date-list">
                </div>
            <div id="time-slots-container" class="time-slots-container">
                <p style="color:#ccc; text-align:center;">Vui lòng chọn ngày để xem suất chiếu.</p>
            </div>
        </div>
        `;
        container.innerHTML = detailHTML;
        renderDateSelector(phim);
    }
    catch(error){
        console.error("Lỗi detail:", error);
        container.innerHTML = "<h1 style='color:red; text-align:center;'>Không thể tải dữ liệu phim. Vui lòng kiểm tra Server.</h1>";
    }
});