// server/config/nodemailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.SMTP_USER, // Brevo SMTP login
    pass: process.env.SMTP_PASS, // Brevo SMTP master password
  },
});

export default transporter;
