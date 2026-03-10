import config from '../config';
import { ISendOtpToPhone } from '../types/smsTemplate';

const sendOtpToPhone = (values: ISendOtpToPhone) => {
  const data = {
    body: `Your OTP is: ${values.otp}. Do not share this code. It expires soon.`,
    from: 'COFFECITO',
    to: values.phone,
  };
  return data;
};

export const smsTemplate = {
  sendOtpToPhone,
};
