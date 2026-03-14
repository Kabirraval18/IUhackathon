const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendOTPEmail = async (email, otp, type = 'verification') => {
  const transporter = createTransporter();

  const subjects = {
    verification: 'Verify Your OilFather Account',
    reset: 'Reset Your OilFather Password'
  };

  const messages = {
    verification: `Your verification OTP is: <strong>${otp}</strong>. Valid for 10 minutes.`,
    reset: `Your password reset OTP is: <strong>${otp}</strong>. Valid for 10 minutes.`
  };

  const mailOptions = {
    from: `"The OilFather IMS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjects[type],
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #d4a853; padding: 40px; border: 1px solid #d4a853;">
        <h1 style="font-size: 28px; letter-spacing: 3px; border-bottom: 1px solid #d4a853; padding-bottom: 20px;">THE OILFATHER</h1>
        <p style="font-size: 16px; color: #ccc;">${messages[type]}</p>
        <div style="background: #1a1a1a; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #d4a853;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #d4a853;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">Do not share this code with anyone. The OilFather never asks for your OTP.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    // For development, just log the OTP
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return { success: true, devOtp: otp };
  }
};

module.exports = { generateOTP, sendOTPEmail };
