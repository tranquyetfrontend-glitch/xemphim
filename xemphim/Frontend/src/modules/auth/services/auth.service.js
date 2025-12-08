import bcrypt from 'bcrypt'; 
import pkg from 'jsonwebtoken';
const jwt = pkg;
import * as dotenv from 'dotenv';
dotenv.config();

import{UserRepository} from '../repositories/user.repository.js';
import {RefreshTokenRepository} from '../repositories/refresh_token.repository.js';
import {sendResetPasswordEmail} from '../../../common/utils/mailer.util.js';

const USER_REPO = new UserRepository();
const REFRESH_REPO = new RefreshTokenRepository();

export class AuthService{
    async hashPassword(password){
        const saltRounds = 10;
        return await bcrypt.hash(password,saltRounds);
    }

    async comparePassword(plainPassword, hash){
        return await bcrypt.compare(plainPassword, hash);
    }

    generateAccessToken(user_id, role){
        return jwt.sign(
            {user_id, role, type: 'access'}, 
            process.env.JWT_SECRET, 
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );
    }

    async generateRefreshToken(user_id, role){
        const refreshToken = jwt.sign(
            {user_id, role, type: 'refresh'},
            process.env.JWT_SECRET, 
            {expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN}
        );
        const decoded = jwt.decode(refreshToken);
        const expirationTimeSeconds = decoded.exp;
        const expirationDate = new Date(expirationTimeSeconds * 1000); 
        await REFRESH_REPO.saveToken(user_id, refreshToken, expirationDate);
        return refreshToken;
    }

    async registerUser(data){
        const existingUser = await USER_REPO.findByEmail(data.email);
        if(existingUser){
            throw new Error('Email đã tồn tại.'); 
        }
        const password_hash = await this.hashPassword(data.password);
        data.password_hash = password_hash;
        if('username' in data){ 
            delete data.username;
        }
        const newUser = await USER_REPO.createUser(data);
        if(!newUser){
            throw new Error('Lỗi tạo tài khoản.');
        }
        return newUser;
    }

    async loginUser(email, password){
        const user = await USER_REPO.findByEmail(email); 
        if(!user){
            throw new Error('Email hoặc Mật khẩu không chính xác.');
        }
        const isPasswordValid = await this.comparePassword(password, user.password_hash);
        if(!isPasswordValid){
            throw new Error('Email hoặc Mật khẩu không chính xác.');
        }
        const accessToken = this.generateAccessToken(user.user_id, user.role);
        const refreshToken = await this.generateRefreshToken(user.user_id, user.role);
        return{
            message: 'Đăng nhập thành công.',
            accessToken, 
            refreshToken,
            user:{
                user_id: user.user_id,
                email: user.email,
                role: user.role
            }
        };
    }

    async refreshAccessToken(oldRefreshToken){
        const tokenInDb = await REFRESH_REPO.findValidToken(oldRefreshToken);
        if(!tokenInDb){
            throw new Error('Refresh Token không hợp lệ, đã hết hạn, hoặc đã bị thu hồi.');
        }
        const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
        
        if(decoded.type !=='refresh'){
            throw new Error('Loại token không hợp lệ.');
        }
        const newAccessToken =this.generateAccessToken(decoded.user_id, decoded.role);
        return{ 
            accessToken: newAccessToken 
        };
    }

    async revokeRefreshToken(token) {
        return await REFRESH_REPO.revokeToken(token);
    }

    async forgotPassword(email){
        const user = await USER_REPO.findByEmail(email);
        if(!user){
            return{message: "Nếu tài khoản tồn tại, liên kết đặt lại sẽ được gửi."};
        }
        const resetToken = jwt.sign(
            {user_id: user.user_id},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000);
        await USER_REPO.updateUserResetToken(user.user_id, resetToken, expirationDate);
        await sendResetPasswordEmail(user.email, resetToken);
        return {message: "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn."};
    }

    async resetPassword(token, newPassword){
        const user = await USER_REPO.findUserByResetToken(token);
        if(!user || user.reset_password_expires < new Date()){
            throw new Error('Token đặt lại không hợp lệ hoặc đã hết hạn.');
        }
        const newPasswordHash = await this.hashPassword(newPassword);
        await USER_REPO.updateUserPassword(user.user_id, newPasswordHash);
        return {message: "Mật khẩu của bạn đã được đặt lại thành công."};
    }
}