import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const{
    AUTH_SERVICE_URL,
    CATALOG_SERVICE_URL,
    BOOKING_SERVICE_URL,
    PAYMENT_SERVICE_URL
} = process.env;

const createPathRewriter = (servicePrefix) => {
    return (path, req) =>{
        const newPath = servicePrefix + path;
        console.log(`[${req.url}] -> Rewriting to: ${newPath}`);
        return newPath;
    };
};

//Auth Service (Đăng nhập, Đăng ký)
app.use('/api/auth', createProxyMiddleware({ 
    target: AUTH_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: createPathRewriter('/api/auth')
}));

//Catalog Service (Phim, Rạp, Combo)
app.use('/api/catalog', createProxyMiddleware({ 
    target: CATALOG_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: createPathRewriter('/api')
}));

//Booking Service (Lịch chiếu, Đặt vé, Lịch sử)
app.use('/api/bookings', createProxyMiddleware({ 
    target: BOOKING_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: createPathRewriter('/api')
}));
app.use('/api/orders', createProxyMiddleware({ 
    target: BOOKING_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: createPathRewriter('/api/orders')
}));
app.use('/api/seats', createProxyMiddleware({ 
    target: BOOKING_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: createPathRewriter('/api/seats')
}));

//Payment Service (Callback)
app.use('/api/payments', createProxyMiddleware({ 
    target: PAYMENT_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: createPathRewriter('/api/payments')
}));


app.use((req, res) => {
    res.status(404).send('API Gateway: Không tìm thấy tài nguyên.');
});

app.listen(PORT, () => {
    console.log(`API Gateway đang chạy trên cổng: ${PORT}`);
    console.log(`Frontend sẽ chỉ cần gọi: http://localhost:${PORT}/api/...`);
});