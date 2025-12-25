import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if(!token){
        return res.status(401).json({ message: 'Truy cập bị từ chối. Không tìm thấy token.' });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    }
    catch(error){
        console.error("Lỗi xác thực Token:", error.message);
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

export const authorizeRole = (requiredRole) =>{
    return (req, res, next) =>{
        if(!req.user || req.user.role !== requiredRole){
            return res.status(403).json({ 
                message: `Quyền truy cập bị từ chối.` 
            });
        }
        next();
    };
};