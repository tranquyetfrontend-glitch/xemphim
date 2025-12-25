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
        if(!newUser || !newUser.user_id || !newUser.email){
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

export const login = async (req, res) => {
    try{
        const {email, password} = req.body; 
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng cung cấp email và mật khẩu." });
        }
        const result = await AUTH_SERVICE.loginUser(email, password); 
        return res.status(200).json(result);
    }
    catch (error){
        console.error("Lỗi đăng nhập:", error.message);
        return res.status(401).json({ 
            message: `Đăng nhập thất bại: ${error.message}` 
        });
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
        return res.status(403).json({message: 'Refresh token không hợp lệ: ' + error.message});
    }
};

export const forgotPassword = async (req, res) =>{
    try{
        const {email} = req.body; 
        if(!email){
            return res.status(400).json({message: "Vui lòng cung cấp địa chỉ email."});
        }
        const result = await AUTH_SERVICE.forgotPassword(email);
        return res.status(200).json({ 
            message: result.message 
        });
    }
    catch (error){
        console.error("Lỗi Controller Forgot Password:", error.message);
        return res.status(500).json({message: "Lỗi máy chủ nội bộ khi xử lý quên mật khẩu."});
    }
};

export const resetPassword = async (req, res) =>{
    try{
        const {token} = req.query; 
        const {newPassword} = req.body;
        if(!token|| !newPassword){
            return res.status(400).json({message: "Thiếu token hoặc mật khẩu mới."});
        }
        await AUTH_SERVICE.resetPassword(token, newPassword);
        return res.status(200).json({ 
            message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.' 
        });
    }
    catch (error) {
        console.error("Lỗi Controller Reset Password:", error.message);
        return res.status(400).json({message: error.message});
    }
};

export const getMe = async (req, res) =>{
    try{
        const userId = req.user.user_id; 
        const user = await AUTH_SERVICE.getMe(userId);
        return res.status(200).json({ 
            message: 'Lấy thông tin thành công',
            user: user 
        });
    }
    catch(error){
        console.error("Lỗi getMe:", error.message);
        return res.status(404).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) =>{
    try{
        const userId = req.user.user_id;
        const { full_name, phone } = req.body; 
        if(!full_name || !phone){
             return res.status(400).json({ message: "Vui lòng nhập họ tên và số điện thoại." });
        }
        const updatedUser = await AUTH_SERVICE.updateProfile(userId, { full_name, phone });
        return res.status(200).json({
            message: 'Cập nhật thành công',
            user: updatedUser
        });
    }
    catch(error){
        console.error("Lỗi updateProfile:", error.message);
        return res.status(500).json({ message: error.message });
    }
};