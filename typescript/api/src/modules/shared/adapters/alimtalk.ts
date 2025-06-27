import { parsePhoneNumber } from 'awesome-phonenumber';
import axios from 'axios';

const appKey = 'your-app-key-here'; // Replace with your actual app key
const secretKey = 'your-secret-key-here'; // Replace with your actual secret key

export const alimtalk = async (
  phone: string,
  template: string,
  substitutions: Record<string, string>,
) => {
  try {
    const pn = parsePhoneNumber(phone, { regionCode: 'KR' });
    if (!pn.valid) throw new Error('Invaild');
    if (!pn.typeIsMobile) throw new Error('Cannot send sms.');
    return await axios({
      method: 'post',
      url: `https://api-alimtalk.cloud.toast.com/alimtalk/v1.5/appkeys/${appKey}/messages`,
      headers: {
        'X-Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
      data: {
        plusFriendId: '@plusfriend-id', // Replace with your actual plus friend ID
        templateCode: template,
        recipientList: [
          {
            recipientNo: pn.number.national.split('-').join(''),
            templateParameter: substitutions,
          },
        ],
      },
    });
  } catch (error) {
    console.error('error :>> ', error);
    throw new Error('알림톡 발송에 실패하였습니다.');
  }
};
