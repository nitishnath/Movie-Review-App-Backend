const nodemailer = require("nodemailer");

function generateOtp(otp_length = 6) {
  let OTP = "";
  for (let i = 1; i <= otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }

  return OTP;
}

function generateMailTransporter() {
  return nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "04a8826f0c60a6",
      pass: "a5de2911505e5c",
    },
  });
}

module.exports = { generateMailTransporter, generateOtp };
