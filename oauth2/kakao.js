const axios = require('axios');

const verifyKakaoToken = async (accessToken) => {
  try {
    const data = await axios('https://kapi.kakao.com/v2/user/me', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!data) {
      await axios('https://kapi.kakao.com/v1/user/update_profile', {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${accessToken}`,
        }
      });
      const newData = await axios('https://kapi.kakao.com/v2/user/me', {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${accessToken}`,
        }
      });
      return newData.data;
    }
    return data.data;
  }
  catch (err) {
    console.error(err);
  }
};

module.exports = { verifyKakaoToken };