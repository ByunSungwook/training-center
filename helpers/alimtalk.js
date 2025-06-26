const { parsePhoneNumber } = require('awesome-phonenumber');
const axios = require('axios');

const appKey = process.env.NHN_ALIMTALK_APP_KEY;
const secretKey = process.env.NHN_ALIMTALK_SECRET_KEY;

module.exports = async (phone, template, substitutions) => {
  try {
    const pn = parsePhoneNumber(phone, { regionCode: 'KR' });
    if (!pn.valid) throw new Error('Invaild');
    if (!pn.typeIsMobile) throw new Error('Cannot send sms.');
    return await axios({
      method: 'post',
      url: `https://api-alimtalk.cloud.toast.com/alimtalk/v1.5/appkeys/${appKey}/messages`,
      headers: {
        'X-Secret-Key': secretKey,
        'Content-Type': 'application/json'
      },
      data: {
        plusFriendId: '@alimtalk-user',
        templateCode: template,
        recipientList: [{
          recipientNo: pn.number.national.split('-').join(''),
          templateParameter: substitutions
        }],
      }
    });
  } catch (error) {
    console.log('error :>> ', error);
  }
};