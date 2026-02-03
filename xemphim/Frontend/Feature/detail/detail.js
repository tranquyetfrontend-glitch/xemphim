// Sử dụng API_CONFIG từ config.js (phải load config.js trước)
const GATEWAY_URL = window.API_CONFIG?.GATEWAY_URL || 'http://127.0.0.1:8080/api';
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

function startCountdown(durationSeconds){
    let timer = durationSeconds, minutes, seconds;
    if(countdownInterval) clearInterval(countdownInterval);
    const displayElement = document.getElementById('countdown');
    if(!displayElement) return;
    countdownInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        displayElement.textContent = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        if(--timer < 0){
            clearInterval(countdownInterval);
            alert("Đã hết thời gian chọn ghế. Vui lòng thử lại!");
            window.location.reload();
        }
    }, 1000);
}

//HÀM CLICK GHẾ
function handleSeatClick(event) {
    const seat = event.target;
    const seatId = seat.dataset.id;
    const seatType = seat.dataset.type.toUpperCase();
    const rowLabel = seat.dataset.row;
    const seatNum = parseInt(seat.dataset.num);
    if(seat.classList.contains('selected')){
        if(seatType === 'COUPLE'){
            const partnerNum = seatNum % 2 === 0 ? seatNum - 1 : seatNum + 1;
            const partner = document.querySelector(`[data-row="${rowLabel}"][data-num="${partnerNum}"]`);
            seat.classList.remove("selected");
            if(partner) partner.classList.remove("selected");
            selectedSeats = selectedSeats.filter(id => id !== seatId && (partner ? id !== partner.dataset.id : true));
        }
        else{
            seat.classList.remove("selected");
            selectedSeats = selectedSeats.filter(id => id !== seatId);
        }
    }
    else{
        if(seatType === 'COUPLE'){
            const partnerNum = seatNum % 2 === 0 ? seatNum - 1 : seatNum + 1;
            const partner = document.querySelector(`[data-row="${rowLabel}"][data-num="${partnerNum}"]`);
            if(partner && !partner.classList.contains('reserved')){
                seat.classList.add('selected');
                partner.classList.add('selected');
                if(!selectedSeats.includes(seatId)) selectedSeats.push(seatId);
                if(!selectedSeats.includes(partner.dataset.id)) selectedSeats.push(partner.dataset.id);
            }
            else{
                alert("Cặp ghế đôi này không khả dụng đủ bộ.");
            }
        }
        else{
            seat.classList.add('selected');
            selectedSeats.push(seatId);
        }
    }
    updateSelectionSummary();
}

//HÀM TÍNH TIỀN
function updateSelectionSummary(returnTotal = false) {
    const seatDisplay = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('total-price-display');
    if(selectedSeats.length === 0){
        if(!returnTotal){
            if(seatDisplay) seatDisplay.textContent = '...';
            if(priceDisplay) priceDisplay.textContent = '0đ';
        }
        return 0;
    }
    let total = 0;
    let seatNames = [];
    selectedSeats.forEach(seatId =>{
        const seatEl = document.querySelector(`[data-id="${seatId}"]`);
        if(seatEl){
            const type = seatEl.dataset.type.toUpperCase();
            const name = `${seatEl.dataset.row}${seatEl.dataset.num}`;
            seatNames.push(name);
            if (type === 'VIP') total += VIP_PRICE;
            else if (type === 'COUPLE') total += (COUPLE_PRICE / 2);
            else total += SEAT_PRICE;
        }
    });
    if (!returnTotal){
        if(seatDisplay) seatDisplay.textContent = seatNames.sort().join(', ');
        if(priceDisplay) priceDisplay.textContent = `${total.toLocaleString('vi-VN')}đ`;
    }
    return total;
}

//HÀM THANH TOÁN
async function handleCheckout(){
    if(selectedSeats.length === 0){
        alert('Vui lòng chọn ít nhất một ghế');
        return;
    }
    const total = updateSelectionSummary(true);
    const seatNames = selectedSeats.map(id =>{
        const el = document.querySelector(`[data-id="${id}"]`);
        return el ? `${el.dataset.row}${el.dataset.num}` : id;
    })
    try{
        const sID = currentShowtimeDetails.showtime_id || currentShowtimeDetails.id;
        const response = await fetch(`${GATEWAY_URL}/bookings/bookings/hold-seats`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                showtime_id: sID,
                user_id: 1,
                seat_ids: selectedSeats
            })
        });
        const result = await response.json();
        if(response.ok){
            localStorage.setItem('paymentData', JSON.stringify({
                showtimeId: sID,
                movieTitle: currentMovie.title,
                seats: selectedSeats,
                seatNames: seatNames,
                total: total,
                holdExpiresAt: result.hold_expires_at
            }));
            window.location.href = '../payment/thanh-toan.html';
        }
        else{
            alert(result.message || "Ghế đã có người khác chọn trước!");
        }
    }
    catch (error){
        alert("Lỗi kết nối Server Booking.");
    }
}

//LẤY SƠ ĐỒ GHẾ
async function fetchSeatMap(showtimeId){
    try{
        const response = await fetch(`${GATEWAY_URL}/bookings/showtimes/${showtimeId}/seats`);
        if (!response.ok) throw new Error("404");
        const data = await response.json();
        return data.seat_map || data;
    }
    catch (error){
        console.error("Lỗi API Ghế", error);
        return null;
    }
}

//HIỂN THỊ CHỌN GHẾ
async function renderSeatSelection(movie, selectedShowtime){
    const sID = selectedShowtime.showtime_id || selectedShowtime.showtimeId || selectedShowtime.id;
    if(!sID){
        console.error("Dữ liệu showtime bị thiếu ID:", selectedShowtime);
        alert("Không tìm thấy ID suất chiếu.");
        return;
    }
    console.log("Đang gọi API lấy ghế cho showtime_id:", sID);
    const seats = await fetchSeatMap(sID);
    if(!seats || seats.length === 0){
        alert("Suất chiếu này hiện chưa có sơ đồ ghế.");
        return;
    }
    const showtimeSection = document.querySelector('.showtime-section');
    if(!showtimeSection) return;
    currentMovie = movie;
    currentShowtimeDetails = selectedShowtime;
    selectedSeats = [];
    const timeStr = new Date(selectedShowtime.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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
    initializeSeatMapFromAPI(seats);
    startCountdown(600);
    document.getElementById('cancel-selection-btn').onclick = () => window.location.reload();
    document.getElementById('checkout-btn').onclick = handleCheckout;
}

//VẼ GHẾ LÊN GRID
function initializeSeatMapFromAPI(seatMap){
    const seatMapGrid = document.getElementById('seat-map-grid');
    if(!seatMapGrid) return;
    seatMapGrid.innerHTML = "";
    const rows = {};
    seatMap.forEach(seat =>{
        if(seat.row_label.toUpperCase() === 'J') return; 
        if(!rows[seat.row_label]) rows[seat.row_label] = [];
        rows[seat.row_label].push(seat);
    });
    Object.keys(rows).sort().forEach(label =>{
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        rowDiv.innerHTML = `<span class="row-label">${label}</span>`;
        rows[label].sort((a, b) => a.seat_number - b.seat_number).forEach(s => {
            const seat = document.createElement('div');
            const status = s.status.toLowerCase();
            const type = s.type.toLowerCase();
            seat.className = `seat ${status} ${type}`;
            seat.dataset.id = s.seat_id;
            seat.dataset.type = s.type;
            seat.dataset.row = label;
            seat.dataset.num = s.seat_number;
            seat.textContent = s.seat_number;
            if(status === 'available') seat.onclick = handleSeatClick;
            rowDiv.appendChild(seat);
        });
        seatMapGrid.appendChild(rowDiv);
    });
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
        </div>`;
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
                const timeStr = new Date(slot.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const btn = document.createElement('button');
                btn.className = 'time-slot-btn';
                btn.textContent = timeStr;
                btn.onclick = () =>{
                    console.log("Dữ liệu slot khi click:", slot);
                    const validID = slot.showtime_id || slot.showtimeId || slot.id;
                    if(!validID){
                    alert("Lỗi: Suất chiếu này không có ID hợp lệ!");
                    return;
                    }
                    slot.showtime_id = validID; 
                    renderSeatSelection(phim, slot);
                };
                timesDiv.appendChild(btn);
            });
            cinemaDiv.appendChild(timesDiv);
            timeSlotsContainer.appendChild(cinemaDiv);
        }
    });
    if(!foundAny){
        timeSlotsContainer.innerHTML = '<p style="color:#ccc; text-align:center;">Không có suất chiếu vào ngày này.</p>';
    }
}

document.addEventListener("DOMContentLoaded", async function(){
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const showtimeIdFromUrl = urlParams.get('showtimeId');
    const container = document.getElementById("movie-detail-container");
    if(!movieId){
        container.innerHTML = "<h1 style='color:white; text-align:center;'>Lỗi: Không tìm thấy ID phim.</h1>";
        return;
    }
    try{
        // Lấy thông tin phim từ Catalog Service
        const catalogUrl = GATEWAY_URL.replace('/api', '/api/catalog');
        const movieResponse = await fetch(`${catalogUrl}/movies/${movieId}`);
        if(!movieResponse.ok) throw new Error('Không thể tải thông tin phim.');
        const phim = await movieResponse.json();
        
        // Lấy lịch chiếu từ Booking Service
        try {
            // Gọi trực tiếp Booking Service trên Render (tránh lỗi 404 qua API Gateway)
            const bookingBaseUrl = 'https://xemphim-booking-service.onrender.com';
            const showtimeResponse = await fetch(`${bookingBaseUrl}/api/showtimes/grouped-by-movie/${movieId}`);
            if(showtimeResponse.ok) {
                const groupedShowtimes = await showtimeResponse.json();
                console.log('Showtimes data from API:', groupedShowtimes);
                // Transform dữ liệu showtimes để phù hợp với format mong đợi
                phim.showtimes = groupedShowtimes.map(group => ({
                    cinemaName: group.cinemaName || group.cinema_name || "Rạp Hệ Thống",
                    address: group.address || "",
                    times: (group.times || []).map(st => ({
                        showtime_id: st.showtimeId || st.showtime_id || st.id,
                        time: st.time || st.start_time,
                        format: st.screenType || st.format || "2D",
                        price: st.price || st.base_price
                    }))
                }));
                console.log('Transformed showtimes:', phim.showtimes);
            } else {
                console.warn('Không thể tải lịch chiếu:', showtimeResponse.status);
                phim.showtimes = [];
            }
        } catch(showtimeError) {
            console.error('Lỗi khi lấy lịch chiếu:', showtimeError);
            phim.showtimes = [];
        }
        
        const bgContainer = document.querySelector('.detail-background');
        if(bgContainer){
            bgContainer.style.setProperty('--detail-bg-image', `url(${phim.poster_url})`);
        }
        document.title = phim.title;
        container.innerHTML = `
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
            <div class="showtime-dates" id="date-list"></div>
            <div id="time-slots-container" class="time-slots-container">
                <p style="color:#ccc; text-align:center;">Vui lòng chọn ngày để xem suất chiếu.</p>
            </div>
        </div>`;
        renderDateSelector(phim);
        if (showtimeIdFromUrl && phim.showtimes){
            console.log("Phát hiện showtimeId từ trang chủ, đang tìm dữ liệu...");
            
            let targetShowtime = null;
            phim.showtimes.forEach(cinema =>{
                const found = cinema.times.find(t => 
                    (t.showtime_id == showtimeIdFromUrl) || 
                    (t.showtimeId == showtimeIdFromUrl) || 
                    (t.id == showtimeIdFromUrl)
                );
                if(found) targetShowtime = found;
            });
            if(targetShowtime){
                targetShowtime.showtime_id = showtimeIdFromUrl;
                renderSeatSelection(phim, targetShowtime);
                document.querySelector('.showtime-section').scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    catch(error){
        console.error("Lỗi detail:", error);
        container.innerHTML = "<h1 style='color:red; text-align:center;'>Không thể tải dữ liệu phim. Vui lòng kiểm tra Server.</h1>";
    }
});