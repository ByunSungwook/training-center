import { env } from '@/env.js';
import { parsePhoneNumber } from 'awesome-phonenumber';
import axios from 'axios';

const APP_KEY = env.TOAST_CLOUD_SMS_APP_KEY;
const SEND_NO = env.TOAST_CLOUD_SMS_SEND_NO;

export const sms = async (phone: string, message: string) => {
  const pn = parsePhoneNumber(phone, { regionCode: 'KR' });
  if (!pn.valid) throw new Error('Invalid');
  if (phone !== '07077640907' && !pn.typeIsMobile)
    throw new Error('Cannot send sms.');
  return await axios({
    method: 'post',
    url: `https://api-sms.cloud.toast.com/sms/v2.1/appKeys/${APP_KEY}/sender/sms`,
    data: {
      body: message,
      sendNo: SEND_NO,
      recipientList: [{ recipientNo: pn.number.national.split('-').join('') }],
    },
  });
};
