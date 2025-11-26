import {AuthService} from '../services/auth.service.js';
import {RegisterSchema} from '../dtos/register.dto.js';

const AUTH_SERVICE = new AuthService();

export const register = async (req, res) =>{
    try{
        const { error, value } = RegisterSchema.validate(req.body);
        if(error){
            return res.status(400).json({ message: error.details[0].message });
        }
        const newUser = await AUTH_SERVICE.registerUser(value);
        if(!newUser || !newUser.user_id || !newUser.email){e
            throw new Error('Đăng ký thất bại do lỗi xử lý nghiệp vụ.');
        }

        return res.status(201).json({ 
            message: 'Đăng ký thành công.', 
            user: { user_id: newUser.user_id, email: newUser.email } 
        });

    } 
    catch(error){
        console.error("Lỗi Controller Register:", error.message);
        let status = 500;
        if(error.message.includes('tồn tại')){
             status = 409;
        } 
        else if(error.message.includes('permission denied')){
             status = 403;
        }
        return res.status(status).json({message: error.message});
    }
};

export const login = async (req, res) =>{
    try{
        const {identifier, password} = req.body;
        
        if(!identifier || !password) {
             return res.status(400).json({message: "Vui lòng nhập Email/Username và Mật khẩu."});
        }
        const result = await AUTH_SERVICE.loginUser(identifier, password);
        return res.status(200).json(result);
    } 
    catch(error){
        console.error("Lỗi Controller Login:", error.message);
        return res.status(401).json({message: 'Đăng nhập thất bại: '+error.message});
    }
};

export const refreshToken = async (req,res) =>{
    try{
        const {refreshToken} = req.body; 
        if(!refreshToken){
            return res.status(400).json({ message: "Không tìm thấy refresh token." });
        }
        const result = await AUTH_SERVICE.refreshAccessToken(refreshToken);
        return res.status(200).json({ 
            message: 'Tạo access token thành công.',
            accessToken: result.accessToken 
        });
    } 
    catch (error){
        console.error("Lỗi Controller Refresh Token:", error.message);
        return res.status(403).json({ message: 'Refresh token không hợp lệ: ' + error.message });
    }
};