import nodemailer from 'nodemailer';
import config from '../config';
import { ISendEmail } from '../interfaces/sendEmail.interface';
import logger from '../logger/winston.logger';
import colors from 'colors';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
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
    logger.info(
      colors.bgGreen(`Email successfully sent to: ${info?.accepted}`),
    );
  } catch (error) {
    logger.error(colors.bgRed(`Email sending failed: ${error}`));
  }
};

export { sendEmail };
