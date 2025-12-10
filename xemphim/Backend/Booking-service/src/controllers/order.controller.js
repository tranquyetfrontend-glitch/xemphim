import { OrderService } from "../services/order.service.js";

const ORDER_SERVICE = new OrderService();

export class OrderController{
    async createOrder(req, res){
        try{
            const{
                user_id,
                showtime_id,
                seat_details,
                combo_items
            } = req.body;
            if(!user_id || !showtime_id || !seat_details || seat_details.length === 0){
                return res.status(400).json({error: 'Thiếu thông tin bắt buộc (user, suất chiếu, ghế).'});
            }
            const parsedShowtimeId = parseInt(showtime_id, 10);
            const result = await ORDER_SERVICE.createOrderAndGetPaymentLink(
                user_id,
                parsedShowtimeId,
                seat_details,
                combo_items || []
            );
            return res.status(201).json(result);
        }
        catch(error){
            console.error('Lỗi tại OrderController (createorder):', error);
            return res.status(500).json({error: 'Lỗi khi tạo đơn hàng:'+ error.message});
        }
    }
}