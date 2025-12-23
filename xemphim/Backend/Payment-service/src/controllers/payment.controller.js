import { PaymentService } from '../services/payment.service.js';

const PAYMENT_SERVICE = new PaymentService();

export class PaymentController{
    async createPaymentLink(req, res){
        try{
            const { order_id, amount, description } = req.body;
            const payUrl = await PAYMENT_SERVICE.createMomoPayment(order_id, amount, description);
            return res.status(200).json({
                message: 'Đã tạo link thanh toán MoMo thành công.',
                payment_url: payUrl
            });
        }
        catch(error){
            console.error('Lỗi tại PaymentController:', error);
            return res.status(500).json({ error: error.message || 'Lỗi khi xử lý thanh toán.'});
        }
    }

    async handlePaymentCallback(req, res){
        try{
            const {order_id, status} = req.body
            if(!order_id || !status){
                return res.status(400).json({message: "Thiếu tham số order_id hoặc status."});
            }
            const result = await PAYMENT_SERVICE.processCallback(order_id, status);
            return res.status(200).json(result);
        }
        catch(error){
            console.error('Lỗi tại PaymentController (handlePaymentCallback):', error);
            return res.status(500).json({error: 'Lỗi khi xử lý callback.'});
        }
    }
}