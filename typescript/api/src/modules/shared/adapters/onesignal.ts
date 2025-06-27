import { env } from '@/env.js';
import axios from 'axios';

const ONESIGNAL_APP_ID = env.ONESIGNAL_APP_ID;
const ONESIGNAL_TOKEN = env.ONESIGNAL_TOKEN;

export const onesignal = (
  userIds: string[],
  headings: string,
  contents: string,
  data?: Record<string, string>,
) => {
  // const debug = process.env.SERVICE_ENVIRONMENT !== 'production';
  // if (debug) {
  //   console.log(
  //     JSON.stringify(
  //       {
  //         headings: { en: headings },
  //         contents: { en: contents },
  //         include_external_user_ids: userIds || [],
  //         data,
  //       },
  //       null,
  //       2,
  //     ),
  //   );
  //   //   return;
  // }

  if (!userIds?.length) return Promise.resolve();
  return axios({
    method: 'post',
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${ONESIGNAL_TOKEN}`,
    },
    data: {
      app_id: `${ONESIGNAL_APP_ID}`,
      headings: { en: headings },
      contents: { en: contents },
      include_external_user_ids: userIds || [],
      channel_for_external_user_ids: 'push',
      data,
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
    },
  }).catch((e) => console.error(e.response.data));
};
