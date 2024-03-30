import modeMailer from "nodemailer";

const sendMail = async (email: string, subject: string, text: string) => {
  const transporter = modeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: text,
  };
  await transporter.sendMail(mailOptions);
};
export default sendMail;
