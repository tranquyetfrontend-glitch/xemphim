import { AuthService } from '../services/auth.service.js';
import { RegisterSchema } from '../dtos/register.dto.js';

const AUTH_SERVICE = new AuthService();

export const register = async (req, res) => {
    try {
        const { error, value } = RegisterSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const newUser = await AUTH_SERVICE.registerUser(value);
        return res.status(201).json({ 
            message: 'Đăng ký thành công.', 
            user: { user_id: newUser.user_id, email: newUser.email } 
        });

    } catch (error) {
        console.error(error);
        const status = error.message.includes('tồn tại') ? 409 : 500;
        return res.status(status).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
             return res.status(400).json({ message: "Vui lòng nhập Email/Username và Mật khẩu." });
        }
        const result = await AUTH_SERVICE.loginUser(identifier, password);
        return res.status(200).json(result);
    } 
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Đăng nhập thất bại: ' + error.message });
    }
};