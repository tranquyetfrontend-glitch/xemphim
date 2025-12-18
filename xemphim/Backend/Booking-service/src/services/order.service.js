import { OrderRepository } from "../repositories/order.repository.js";
import axios from 'axios';

const ORDER_REPO = new OrderRepository();
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004';

export class OrderService{
    async createOrderAndGetPaymentLink(userId, showtimeId, seatDetails, comboItems){
        const seatIds = seatDetails.map(d => d.seat_id);
        const pricing = await ORDER_REPO.getPricingInfo(showtimeId, seatIds, comboItems);
        let totalAmount = 0;
        const detailsToSave = [];
        pricing.seatInfo.forEach(seat => {
            const ticketPrice = parseFloat(seat.base_price);
            totalAmount += ticketPrice;
            detailsToSave.push({
                type: 'TICKET',
                price: ticketPrice,
                quantity: 1,
                seat_id: seat.seat_id,
                product_id: null
            });
        });
        comboItems.forEach(item =>{
            const comboPrice = pricing.comboPrices.find(p => p.product_id === item.product_id);
            if(!comboPrice){
                throw new Error(`Không tìm thấy giá cho sản phẩm ID: ${item.product_id}`);
            }
            const itemTotal = parseFloat(comboPrice.price) * item.quantity;
            totalAmount += itemTotal;
            detailsToSave.push({
                type: 'COMBO',
                price: parseFloat(comboPrice.price),
                quantity: item.quantity,
                seat_id: null,
                product_id: item.product_id
            });
        });
        const order = await ORDER_REPO.createOrder(userId, showtimeId, totalAmount);
        const orderId = order.order_id;
        for (const detail of detailsToSave){
            await ORDER_REPO.createOrderDetail(
                orderId, 
                detail.type, 
                detail.price, 
                detail.quantity, 
                detail.seat_id, 
                detail.product_id
            );
        }
        try{
            const paymentResponse = await axios.post(`${PAYMENT_SERVICE_URL}/api/payments/create`,{
                order_id: orderId,
                amount: totalAmount,
                description: `Thanh toán vé xem phim cho Order #${orderId}`
            });
            const paymentUrl = paymentResponse.data.payment_url;
            return{
                order_id: orderId,
                total_amount: totalAmount,
                payment_url: paymentUrl
            };
        }
        catch(error){
            console.error('Lỗi khi gọi Payment Service:', error.message);
            throw new Error('Lỗi kết nối hoặc xử lý thanh toán.');
        }
    }
    async confirmOrder(orderId, paymentStatus){
        const updateOrder = await ORDER_REPO.updateOrderStatus(orderId, paymentStatus);
        if(paymentStatus === 'PAID'){
            const{showtime_id} = updateOrder;
            const seatIds = await ORDER_REPO.getHeldSeatsForOrder(orderId);
            if(seatIds.length === 0){
                return {message: "Đơn hàng chỉ có combo, đã có PAID.", order: updateOrder};
            }
            await ORDER_REPO.bookSeats(showtime_id, seatIds.map(s => s.seat_id));
            return {message: "Đơn hàng đã được xác nhận và ghế đã được BOOKED.", order: updateOrder};
        }
        else{
            await ORDER_REPO.releaseHeldSeats(orderId);
            return {message: "Đơn hàng thất bại, ghế đã được nhả.", order: updateOrder};
        }
    }
}