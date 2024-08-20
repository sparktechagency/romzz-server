import nodemailer from 'nodemailer';
import config from '../config';
import { ISendEmail } from '../interfaces';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: config.smtpEmailUser,
    pass: config.smtpEmailPass,
  },
});

const sendEmail = async (payload: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: config.smtpEmailUser,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    console.log('Mail send successfully', info.accepted);
  } catch (error) {
    console.error('Email', error);
  }
};

export { sendEmail };
