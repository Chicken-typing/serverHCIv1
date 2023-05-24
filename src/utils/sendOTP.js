import nodemailer from 'nodemailer'
const sendOTP = (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "lifesport.hcmvn@gmail.com",
      pass: "nzpwluzpbkydpvze",
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
  });
  const mailOptions = {
    from: "lifesport.hcmvn@gmail.com",
    to: email,
    subject: "Code Verification",
    html: `<p>LS-<b>${verificationCode}</b> is your verification code.</p>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
export default sendOTP
