import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const sendResetPasswordEmail =async(toEmail,token)=>{
    const resetLink = `${process.env.CLIENT_URL}/Frontend/Feature/auth/reset-password.html?token=${token}`;
    const mailOptions = {
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_USER}>`,
        to: toEmail,
        subject: 'Yêu cầu Đặt lại Mật khẩu',
        html: `
            <h2>Xin chào,</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng nhấp vào liên kết dưới đây để tiến hành đặt lại:</p>
            <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại Mật khẩu</a></p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Liên kết sẽ hết hạn sau 1 giờ.</p>
        `,
    };
    try{
        await transporter.sendMail(mailOptions);
        console.log(`Email đặt lại mật khẩu đã được gửi đến: ${toEmail}`);
        return true;
    }
    catch(error){
        console.error("Lỗi khi gửi email:", error);
        throw new Error('Không thể gửi email đặt lại mật khẩu.');
    }
};