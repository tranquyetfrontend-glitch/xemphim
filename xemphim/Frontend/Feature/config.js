// Config cho API URLs
const API_CONFIG = {
    // Local development
    LOCAL: 'http://127.0.0.1:8080/api',
    
    // Production (URL Backend đã deploy trên Render)
    PRODUCTION: 'https://xemphim-2.onrender.com/api',
    
    // Tự động chọn URL dựa vào environment
    get GATEWAY_URL() {
        // Nếu đang chạy trên Vercel (production)
        if (window.location.hostname.includes('vercel.app')) {
            return this.PRODUCTION;
        }
        // Nếu chạy local
        return this.LOCAL;
    },
    
    // Helper để lấy Auth URL
    get AUTH_URL() {
        return this.GATEWAY_URL.replace('/api', '/api/auth');
    }
};

// Export để các file khác dùng
window.API_CONFIG = API_CONFIG;

