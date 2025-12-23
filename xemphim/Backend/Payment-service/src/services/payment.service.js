import axios from "axios";
import crypto from "crypto";

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:3003';

export class PaymentService{
    async createMomoPayment(orderId, amount, description){
        console.log(`[PAYMENT] Đang gọi MoMo cho Order: ${orderId}, Số tiền: ${amount}`);
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const endpoint = process.env.MOMO_ENDPOINT;
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestType = "captureWallet";
        const requestId = orderId + "_" + Date.now();
        const extraData = "";
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${description}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');
        const requestBody ={
            partnerCode,
            partnerName: "Cinema Smart",
            storeId: "MomoStore",
            requestId,
            amount,
            orderId,
            orderInfo: description,
            redirectUrl,
            ipnUrl,
            lang: 'vi',
            extraData,
            requestType,
            signature
        };
        try{
            const response = await axios.post(endpoint, requestBody);
            return response.data.payUrl; 
        }
        catch(error){
            console.error('Lỗi gọi API MoMo:', error.response?.data || error.message);
            throw new Error('Không thể khởi tạo giao dịch MoMo');
        }
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