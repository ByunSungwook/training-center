const axios = require('axios');
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_TOKEN = process.env.ONESIGNAL_TOKEN;

module.exports = (userIds, headings, contents, data) => {
  const debug = process.env.SERVICE_ENVIRONMENT !== 'production';
  if (debug) {
    console.log(JSON.stringify({
      headings: { en: headings },
      contents: { en: contents },
      include_external_user_ids: userIds || [],
      data,
    }, null, 2));
    //   return;
  }

  if (!(userIds?.length)) return Promise.resolve();
  return axios({
    method: 'post',
    url: 'https://api.onesignal.com/notifications?c=push',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Key ${ONESIGNAL_TOKEN}`,
    },
    data: {
      app_id: `${ONESIGNAL_APP_ID}`,
      headings: { en: headings },
      contents: { en: contents },
      include_external_user_ids: userIds || [],
      channel_for_external_user_ids: 'push',
      data,
      'ios_badgeType': 'Increase',
      'ios_badgeCount': 1,
    },
  }).catch(e => console.error(e.response.data));
}