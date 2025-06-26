const axios = require('axios');

const apiKey = process.env.IAMPORT_API_KEY;
const apiSecret = process.env.IAMPORT_SECRET;

let token = '';
let expiredAt = '';

const iamport = {
  async getToken() {
    if (token && expiredAt > Date.now()) {
      return token;
    }
    const { data } = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: apiKey,
      imp_secret: apiSecret
    });
    token = data.response.access_token;
    expiredAt = Date.now() + data.response.expired_at;
    return token;
  },
  async verify(imp_uid) {
    const token = await this.getToken();
    try {
      const { data } = await axios.get(`https://api.iamport.kr/certifications/${imp_uid}`, {
        headers: {
          Authorization: token
        }
      });
      return data.response;
    }
    catch (err) {
      throw new Error(`다음과 같은 이유로 인증에 실패했습니다: ${err})}`);
    }
  }
}

module.exports = iamport;