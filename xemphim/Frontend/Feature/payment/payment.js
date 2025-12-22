document.addEventListener('DOMContentLoaded', () =>{
    const paymentDataJSON = localStorage.getItem('paymentData');
    if(!paymentDataJSON){
        alert('Không tìm thấy thông tin vé. Quay về trang chủ.');
        window.location.href = '../home/index.html';
        return;
    }
    const data = JSON.parse(paymentDataJSON);
    const fee = 0;
    const finalTotal = data.total + fee;
    const totalFormatted = data.total.toLocaleString('vi-VN') + 'đ';
    const finalTotalFormatted = finalTotal.toLocaleString('vi-VN') + 'đ';
    let selectedPaymentMethod = 'vietqr';
    document.getElementById('payment-movie-title').textContent = data.movieTitle;
    document.getElementById('payment-showtime').textContent = data.showtime;
    document.getElementById('payment-format').textContent = data.dinhDang || '2D';
    document.getElementById('payment-room').textContent = data.phongChieu || '13';
    const displaySeats = data.seatNames ? data.seatNames : data.seats;
    document.getElementById('payment-seats').textContent = displaySeats.join(', ');
    
    const summaryBody = document.getElementById('payment-summary-body');
    const seatCount = data.seats.length;
    const seatRowHTML = `
        <tr>
            <td>Vé (${seatCount} ghế)</td>
            <td>${seatCount}</td>
            <td>${totalFormatted}</td>
        </tr>
    `;
    summaryBody.innerHTML = seatRowHTML;
    
    document.getElementById('cost-subtotal').textContent = totalFormatted;
    const costFeeElement = document.getElementById('cost-fee');
    if(costFeeElement){
        costFeeElement.textContent = fee.toLocaleString('vi-VN') + 'đ';
    }
    document.getElementById('cost-total').textContent = finalTotalFormatted;
    const backBtn = document.getElementById('back-to-seats-btn');
    if(backBtn){
        backBtn.addEventListener('click', () => {
            window.history.back(); 
        });
    }
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedPaymentMethod = this.getAttribute('data-method');
            console.log('Phương thức thanh toán đã chọn:', selectedPaymentMethod);
        });
    });
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    if(confirmPaymentBtn){
        confirmPaymentBtn.addEventListener('click', () =>{
            if (!selectedPaymentMethod) {
                alert('Vui lòng chọn phương thức thanh toán.');
                return;
            }
            alert(`Xác nhận thanh toán ${finalTotalFormatted} bằng ${selectedPaymentMethod.toUpperCase()}. (Đang mô phỏng...)`);
        });
    }
});