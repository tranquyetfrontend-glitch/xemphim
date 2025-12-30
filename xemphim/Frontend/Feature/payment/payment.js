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
    let selectedPaymentMethod = 'momo';
    document.getElementById('payment-movie-title').textContent = data.movieTitle;
    document.getElementById('payment-showtime').textContent = data.showtime;
    document.getElementById('payment-format').textContent = data.dinhDang || '2D';
    document.getElementById('payment-room').textContent = data.phongChieu || 'Rạp 1';
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

    //xử lý phương thức thanh toán
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedPaymentMethod = this.getAttribute('data-method');
        });
    });

    //xử lý nút quay lại
    const backBtn = document.getElementById('back-to-seats-btn');
    if(backBtn){
        backBtn.addEventListener('click', () => {
            window.history.back(); 
        });
    }
    
    //xử lý xác nhận thanh toán
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    if(confirmPaymentBtn){
        confirmPaymentBtn.addEventListener('click', async () =>{
            if(selectedPaymentMethod === 'momo'){
                confirmPaymentBtn.disabled = true;
                confirmPaymentBtn.textContent = "Đang kết nối MOMO ...";
                try{
                    const paymentUrl = window.API_CONFIG?.GATEWAY_URL?.replace('/api', '/api/payments/create') || 'http://localhost:8080/api/payments/create';
                    const response = await fetch(paymentUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            order_id: "BILL_" + Date.now(),
                            amount: finalTotal,
                            description: `Thanh toán vé phim: ${data.movieTitle}`
                        })
                    });
                    const result = await response.json();
                    if(response.ok && result.payment_url){
                        window.location.href = result.payment_url;
                    }
                    else{
                        alert('Lỗi khởi tạo thah toán: '+ (result.error || 'Vui lòng thử lại.'));
                        confirmPaymentBtn.disabled = false;
                        confirmPaymentBtn.textContent = "Xác nhận thanh toán";
                    }
                }
                catch(error){
                    console.error('Lỗi kết nối Backend:', error);
                    alert('Không thể kết nối đến máy chủ thanh toán.');
                    confirmPaymentBtn.disabled = false;
                    confirmPaymentBtn.textContent = "Xác nhận thanh toán";
                }
            }
            else{
                alert('Phương thức này đang được bảo trì, vui lòng chọn MoMo');
            }
        });
    }
});