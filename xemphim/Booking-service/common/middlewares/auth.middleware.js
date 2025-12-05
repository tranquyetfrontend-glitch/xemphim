import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export const authenticateToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if(token == null){
        return res.status(401).json({ 
            message: 'Truy cập bị từ chối. Không tìm thấy token xác thực.' 
        });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } 
    catch(error){
        return res.status(403).json({ 
            message: 'Token không hợp lệ hoặc đã hết hạn.' 
        });
    }
};

export const authorizeRole = (requiredRole) =>{
    return(req, res, next) => {
        if(!req.user || req.user.role !== requiredRole){
            return res.status(403).json({ 
                message: `Truy cập bị từ chối. Chỉ có tài khoản ${requiredRole} mới được phép.`
            });
        }
        next();
    };
};