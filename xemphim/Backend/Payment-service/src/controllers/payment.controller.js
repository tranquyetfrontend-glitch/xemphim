import { PaymentService } from '../services/payment.service.js';

const PAYMENT_SERVICE = new PaymentService();

export class PaymentController{
    async createPaymentLink(req, res){
        try{
            const {order_id, amount, description} = req.body;
            const paymentUrl = await PAYMENT_SERVICE.createMockPayment(order_id, amount, description);
            return res.status(200).json({ 
                message: 'Đã tạo link thanh toán thành công.',
                payment_url: paymentUrl
            });
        }
        catch (error){
            console.error('Lỗi tại PaymentController (createPaymentLink):', error);
            return res.status(500).json({error: 'Lỗi khi xử lý thanh toán.'});
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