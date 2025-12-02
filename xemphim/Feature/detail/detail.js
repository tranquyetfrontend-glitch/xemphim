let countdownInterval;
let selectedSeats = [];
const SEAT_PRICE = 80000;
const VIP_PRICE = 100000;
const COUPLE_PRICE = 180000;
const RESERVED_SEATS = []; 
const VIP_ROWS = ['D','E','F','G','H'];
const SEAT_ROWS = ['A','B','C','D','E','F','G','H','I'];
const COUPLE_SEATS_LEFT = ['I1', 'I3', 'I5', 'I7', 'I9'];
const COUPLE_SEATS_RIGHT = ['I2', 'I4', 'I6', 'I8', 'I10'];
const SEAT_PER_ROW = 11;
let currentMovie = {};
let currentSelectedTime = "";

function startCountdown(durationSeconds){
    let timer = durationSeconds, minutes, seconds;
    if(countdownInterval) clearInterval(countdownInterval);
    const displayElement = document.getElementById('countdown');
    if(!displayElement) return;
    countdownInterval = setInterval(()=>{
        minutes = parseInt(timer / 60,10);
        seconds = parseInt(timer % 60,10);
        minutes = minutes <10 ? "0" + minutes : minutes;
        seconds = seconds <10 ? "0" + seconds : seconds;
        displayElement.textContent = minutes + ":" + seconds;
        if(--timer < 0){
            clearInterval(countdownInterval);
            alert("Đã hết thời gian chọn ghế. Vui lòng thử lại!"); 
            window.location.reload()
        }
    },1000);
}

function initializeSeatMap(){
    const seatMapGrid = document.getElementById('seat-map-grid');
    if(!seatMapGrid) return;
    seatMapGrid.innerHTML = "";
    SEAT_ROWS.forEach(row=>{
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        rowDiv.innerHTML = `<span class="row-label">${row}</span>`;
        for (let i=1;i<=SEAT_PER_ROW;i++){
            if (row === 'I' && i > 10) {
                continue;
            }
            const seatId = row + i;
            const seat = document.createElement('div');
            seat.className = "seat";
            seat.dataset.id = seatId;
            seat.dataset.row = row;
            seat.dataset.number = i;
            seat.textContent = i; 
            let isReserved = RESERVED_SEATS.includes(seatId);
            let isVip = VIP_ROWS.includes(row);
            let isCouple = COUPLE_SEATS_LEFT.includes(seatId) || COUPLE_SEATS_RIGHT.includes(seatId);
            if(isReserved){
                seat.classList.add('reserved');
            }
            else{
                seat.classList.add('available');
                if(isVip){
                    seat.classList.add('vip');
                }
                if(isCouple) {
                    seat.classList.add('couple');
                    seat.classList.remove('vip'); 
                }
                seat.addEventListener('click', handleSeatClick);
            }
            rowDiv.appendChild(seat);
        }
        seatMapGrid.appendChild(rowDiv);
    });
}

/*
@param {Event} event - sự kiện click
*/

function handleSeatClick(event){
    const seat = event.target;
    const seatId = seat.dataset.id;
    let partnerId = null;
    let partnerSeat = null;
    if (COUPLE_SEATS_LEFT.includes(seatId)) {
        const seatNum = parseInt(seat.dataset.number);
        partnerId = seat.dataset.row + (seatNum + 1);
        partnerSeat = document.querySelector(`[data-id="${partnerId}"]`);
    } 
    else if (COUPLE_SEATS_RIGHT.includes(seatId)) {
        const seatNum = parseInt(seat.dataset.number);
        partnerId = seat.dataset.row + (seatNum - 1);
        partnerSeat = document.querySelector(`[data-id="${partnerId}"]`);
    }
    if(seat.classList.contains('selected')){ 
        seat.classList.remove("selected");
        selectedSeats = selectedSeats.filter(id => id !== seatId);
        if (partnerSeat && partnerSeat.classList.contains('selected')) {
            partnerSeat.classList.remove('selected');
            selectedSeats = selectedSeats.filter(id => id !== partnerId);
        }
    }
    else{
        seat.classList.add('selected');
        selectedSeats.push(seatId);
        if (partnerSeat && partnerSeat.classList.contains('available')) {
            partnerSeat.classList.add('selected');
            selectedSeats.push(partnerId); 
        }
    }
    updateSelectionSummary();
}

/*
thanh toán, tổng tiền
*/
function updateSelectionSummary(returnTotal = false){
    const seatDisplay = document.getElementById('selected-seats-display');
    const priceDisplay = document.getElementById('total-price-display');
    if(!seatDisplay || !priceDisplay) {
        console.error("Lỗi: Không tìm thấy 'selected-seats-display' hoặc 'total-price-display'");
        return 0;
    }
    const sortedSeats = [...selectedSeats].sort();
    if(selectedSeats.length === 0){
        if(!returnTotal){
            seatDisplay.textContent = '...';
            priceDisplay.textContent = '0đ'
        }
        return 0;
    }
    if(!returnTotal){
        seatDisplay.textContent = sortedSeats.join(', ');
    }
    let total = 0;
    const processed = new Set();
    selectedSeats.forEach(seatId =>{
        if (processed.has(seatId)) return;
        const row = seatId.charAt(0);
        const seatNum = parseInt(seatId.substring(1));
        let isCouple = COUPLE_SEATS_LEFT.includes(seatId) || COUPLE_SEATS_RIGHT.includes(seatId);
        if (isCouple) {
            total += COUPLE_PRICE;
            processed.add(seatId);
            let partnerId = COUPLE_SEATS_LEFT.includes(seatId) ? row + (seatNum + 1) : row + (seatNum - 1);
            processed.add(partnerId);
        } 
        else if (VIP_ROWS.includes(row)) {
            total += VIP_PRICE;
            processed.add(seatId);
        } 
        else {
            total += SEAT_PRICE;
            processed.add(seatId);
        }
    });
    if (!returnTotal) {
        priceDisplay.textContent = `${total.toLocaleString('vi-VN')}đ`;
    }
    return total;
}

/*
xử lý nút bấm thanh toán
*/
function handleCheckout(){
    const seatsToCheckout = [...selectedSeats];
    const total = updateSelectionSummary(true);
    if(selectedSeats.length === 0){
        alert('Vui lòng chọn ít nhất một ghế');
        return;
    }
    if(countdownInterval){
        clearInterval(countdownInterval);
    }
    const paymentData = {
        movieTitle: currentMovie.title,
        showtime: currentSelectedTime,
        seats: seatsToCheckout,
        total: total,
    };
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    window.location.href = '../payment/thanh-toan.html';
}

/*
Hàm chính: Thay thế khối lịch chiếu bằng giao diện chọn ghế
@param {string} time - giờ chiếu đã chọn
@param {string} movieTitle - tên phim
*/
function renderSeatSelection(time, movie){
    const showtimeSection = document.querySelector('.showtime-section');
    if(!showtimeSection) return;
    currentMovie =movie;
    currentSelectedTime = time;
    selectedSeats = [];
    let seatHTML=`
    <div class="seat-selection-content">
        <div class="showtime-header">
            <span class="movie-title-display">${movie.tieuDe}</span>
            <span class="showtime-display">Giờ chiếu: ${time}</span>
            <span class="timer-display">Thời gian chọn ghế: <span id="countdown">10:00</span></span>
        </div>
        <div class="screen-area">
            <div class="screen-indicator">MÀN HÌNH</div>
            <div class="screen-line"></div>
        </div>
        <div class="seating-chart">
            <div id="seat-map-grid">
                </div>
        </div>
        <div class="legend-and-payment">
            <div class="seat-legend">
                <span class="legend-item"><span class="seat-example reserved"></span>Đã đặt</span>
                <span class="legend-item"><span class="seat-example selected"></span>Bạn chọn</span>
                <span class="legend-item"><span class="seat-example available"></span>Ghế thường</span>
                <span class="legend-item"><span class="seat-example vip"></span>Ghế VIP</span>
                <span class="legend-item"><span class="seat-example couple"></span>Ghế đôi</span>
            </div>
            <div class="payment-summary">
                <p>Ghế đã chọn: <span id="selected-seats-display">...</span></p>
                <p>Tổng tiền: <span id="total-price-display">0đ</span></p>
                <div class="action-buttons">
                    <button id="cancel-selection-btn" class="btn btn-secondary">Quay lại</button>
                    <button id="checkout-btn" class="btn btn-primary">Thanh toán</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    showtimeSection.innerHTML = seatHTML; 
    initializeSeatMap();
    startCountdown(60*10);
    const cancelBtn = document.getElementById('cancel-selection-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
        if (cancelBtn){
            cancelBtn.addEventListener('click',()=>{
                if (countdownInterval) clearInterval(countdownInterval);
                window.location.reload();
            });
        }
        if (checkoutBtn){
            checkoutBtn.addEventListener('click', handleCheckout);
        }
}

document.addEventListener("DOMContentLoaded",async function(){
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const container = document.getElementById("movie-detail-container");
    if(!movieId){
        container.innerHTML = "<h1>Lỗi: Không tìm thấy ID phim trên URL.</h1>";
        return;
    }
    try{
        const response = await fetch(`http://127.0.0.1:3001/api/movies/${movieId}`);
        if(!response.ok){
            throw new Error('Không thể tải thông tin phim.');
        }
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
                    <p>${phim.description || 'Chưa có mô tả.'}</p>
                </div>
                <div class="detail-buttons">
                    <a href="#" class="btn btn-primary">Chi tiết nội dung</a>
                    ${phim.trailer_url ? `<a href="${phim.trailer_url}" target="_blank" class="btn btn-secondary">Xem trailer</a>` : ''}
                </div>
            </div>
        </div>

        <div class="showtime-section">
            <h3 style="color:white; margin-bottom:15px; border-left: 4px solid #e71a0f; padding-left:10px;">LỊCH CHIẾU</h3>
            <div class="showtime-dates" id="date-list">
                </div>
            <div id="time-slots-container" class="time-slots-container">
                <p style="color:#ccc">Vui lòng chọn ngày để xem suất chiếu.</p>
            </div>
        </div>
        `;
        container.innerHTML = detailHTML;
        const dateListContainer = document.getElementById('date-list');
        const timeSlotsContainer = document.getElementById('time-slots-container');
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
        function updateShowtimes(selectedDate) {
            timeSlotsContainer.innerHTML = '';
            if (!phim.showtimes || phim.showtimes.length === 0) {
                timeSlotsContainer.innerHTML = '<p style="color:#999">Chưa có lịch chiếu nào.</p>';
                return;
            }
            let hasShowtime = false;
            phim.showtimes.forEach(cinema => {
                const validTimes = cinema.times.filter(t => {
                    const tDate = new Date(t.time).toISOString().split('T')[0];
                    return tDate === selectedDate;
                });
                if (validTimes.length > 0) {
                    hasShowtime = true;
                    const cinemaDiv = document.createElement('div');
                    cinemaDiv.className = 'cinema-group';
                    cinemaDiv.innerHTML = `<h4 style="color:#e71a0f; margin:10px 0;">${cinema.cinemaName}</h4>`;
                    
                    const timesDiv = document.createElement('div');
                    timesDiv.className = 'cinema-times';
                    validTimes.forEach(slot => {
                        const timeObj = new Date(slot.time);
                        const timeStr = timeObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                        const btn = document.createElement('a');
                        btn.href = "#";
                        btn.className = 'time-slot-btn';
                        btn.textContent = timeStr;
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            renderSeatSelection(timeStr, phim);
                        });
                        timesDiv.appendChild(btn);
                    });
                    cinemaDiv.appendChild(timesDiv);
                    timeSlotsContainer.appendChild(cinemaDiv);
                }
            });
            if(!hasShowtime){
                timeSlotsContainer.innerHTML = '<p style="color:#999">Không có suất chiếu vào ngày này.</p>';
            }
        }
        const dateItems = document.querySelectorAll('.date-item');
        dateItems.forEach(item =>{
            item.addEventListener('click', function() {
                document.querySelectorAll('.date-item').forEach(d =>d.classList.remove('active'));
                this.classList.add('active');
                const date = this.getAttribute('data-date');
                updateShowtimes(date);
            });
        });
        const firstDate = dateItems[0].getAttribute('data-date');
        updateShowtimes(firstDate);
    }
    catch(error){
        console.error("Lỗi:",error);
        container.innerHTML = "<h1>Không thể tải dữ liệu phim. Vui lòng kiểm tra kết nối Server.</h1>";
    }
});