import nodemailer from 'nodemailer';
import { config } from '../config';

// Create a mail transporter using the mailTrap configuration
const transporter = nodemailer.createTransport({
  host: config.mailTrap.host,
  port: config.mailTrap.port,
  auth: {
    user: config.mailTrap.user,
    pass: config.mailTrap.pass,
  },
});

export const sendResetPasswordEmail = async (email: string, resetToken: string) => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: 'noreply@example.com',
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}`,
    html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`
  };

  await transporter.sendMail(mailOptions);
};
