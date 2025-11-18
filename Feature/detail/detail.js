let countdownInterval;

let selectedSeats = [];
const SEAT_PRICE = 80000;
const VIP_PRICE = 100000;
const COUPLE_PRICE = 180000;
const RESERVED_SEATS =[]; 
const VIP_ROWS = ['D','E','F','G','H'];
const SEAT_ROWS = ['A','B','C','D','E','F','G','H','I'];
const COUPLE_SEATS_LEFT = ['I1', 'I3', 'I5', 'I7', 'I9'];
const COUPLE_SEATS_RIGHT = ['I2', 'I4', 'I6', 'I8', 'I10'];
const SEAT_PER_ROW = 11;

/*
@param {number} durationSeconds - Thời gian đếm ngược (tính bằng giây)
*/

function startCountdown(durationSeconds){
    let timer = durationSeconds, minutes, seconds;
    if(countdownInterval){
        clearInterval(countdownInterval);
    }
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
            alert("đã hết thời gian chọn ghế. Vui lòng thử lại!"); 
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
        movieTitle: currentMovie.tieuDe,
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
                        timesHTML += `<a href="#" class="time-slot-btn" data-time="${time}">${time}</a>`;
                    });
                }
                else{
                    timesHTML =`<p style="color: #ccc; margin-left: 15px;">Chưa có suất chiếu cho ngày này.</p>`;
                }
                timeSlotsContainer.innerHTML = timesHTML;
                attachTimeSlotListeners();
            }

            /*
            gắn sự kiện click cho các nút giờ chiếu
            */
            function attachTimeSlotListeners(){
                document.querySelectorAll('.time-slot-btn').forEach(button=>{
                    button.addEventListener('click', function(e){
                        e.preventDefault();
                        const selectedTime = this.getAttribute('data-time');
                        renderSeatSelection(selectedTime, phim);
                    });
                });
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