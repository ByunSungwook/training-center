const { parsePhoneNumber } = require('awesome-phonenumber');
const axios = require('axios');

const APP_KEY = process.env.TOAST_CLOUD_SMS_APP_KEY;

module.exports = async (phone, message) => {
  const pn = parsePhoneNumber(phone, { regionCode: 'KR' });
  if (!pn.valid) throw new error('Invalid');
  if (!pn.typeIsMobile) throw new error('Cannot send sms.');
  return await axios({
    method: 'post',
    url: `https://api-sms.cloud.toast.com/sms/v2.1/appKeys/${APP_KEY}/sender/sms`,
    data: {
      body: message,
      sendNo: process.env.TOAST_CLOUD_SMS_SEND_NO,
      recipientList: [{ recipientNo: pn.number.national.split('-').join('') }],
    }
  });
}