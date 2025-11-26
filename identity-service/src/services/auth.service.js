import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

import{UserRepository} from '../repositories/user.repository.js';
import {RefreshTokenRepository} from '../catalog/repositories/refresh_token.repository.js';

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
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        await REFRESH_REPO.saveToken(user_id, refreshToken, expirationDate);
        return refreshToken;
    }

    async registerUser(data){
        const existingUser = await USER_REPO.findByEmailOrUsername(data.email);
        if(existingUser){
            throw new Error('Email hoặc Username đã tồn tại.');
        }
        const password_hash = await this.hashPassword(data.password);
        data.password_hash = password_hash;
        const newUser = await USER_REPO.createUser(data);
        if(!newUser){
            throw new Error('Lỗi tạo tài khoản.');
        }
        return newUser;
    }

    async loginUser(identifier, password){
        const user = await USER_REPO.findByEmailOrUsername(identifier);
        if(!user){
            throw new Error('Tài khoản không tồn tại.');
        }
        const isPasswordValid = await this.comparePassword(password, user.password_hash);
        if(!isPasswordValid) {
            throw new Error('Mật khẩu không chính xác.');
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
}