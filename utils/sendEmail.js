import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSCODE,
  },
});

export function emailSend(to, body) {
  return transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Password 3",
    html: body,
  });
}
