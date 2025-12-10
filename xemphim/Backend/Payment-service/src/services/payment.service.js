import axios from "axios";

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

export class PaymentService{
    async createMockPayment(orderId, amount, description) {
        console.log(`[PAYMENT] Đang xử lý tạo link thanh toán cho Order ID: ${orderId}, Amount: ${amount}`);
        const mockPaymentGatewayUrl = 'http://mock-payment-gateway.com/checkout';
        const transactionToken = 'TKN-' + Math.random().toString(36).substring(2, 9);
        return `${mockPaymentGatewayUrl}?orderId=${orderId}&amount=${amount}&token=${transactionToken}`;
    }

    async processCallback(orderId, status){
        console.log(`[PAYMENT] Nhận Callback cho Order ID: ${orderId}, Status: ${status}`);
        if(status === 'SUCCESS'){
            try{
                const bookingResponse = await axios.post(`${BOOKING_SERVICE_URL}/api/orders/confirm`,{
                    order_id: orderId,
                    payment_status: 'PAID'
                });
                return{
                    message: "Xử lý callback thành công. Đã thông báo cho booking Service.",
                    booking_status: bookingResponse.data
                };
            }
            catch(error){
                console.error('Lỗi khi gọi Booking Service Confirm:', error.message);
                throw new Error('Lỗi khi xác nhận đơn hàng với Booking Service.');
            }
        }
        else{
            return{message: "Giao dịch thất bại. Không cần xác nhận đơn hàng."};
        }
    }
}