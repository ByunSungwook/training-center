import { env } from '@/env.js';
import { dayjs } from '@/lib/dayjs.js';

const SERVICE_KEY = env.DATA_GO_BUSINESS_DATA_VALIDATION_API_KEY;

type BusinessValidationResult = {
  status_code: string;
  data: [
    {
      valid: string;
      valid_msg: string;
    },
  ];
};

export const businessValidator = async (data: {
  registrationNumber: string;
  openedDate: string;
  ceo: string;
  serviceName: string;
  businessType: string | null;
  businessModel: string | null;
}) => {
  const reply = await fetch(
    `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${SERVICE_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        businesses: [
          {
            b_no: data.registrationNumber,
            start_dt: dayjs(data.openedDate, 'YYYY-MM-DD').format('YYYYMMDD'),
            p_nm: data.ceo,
            p_nm2: '',
            b_nm: data.serviceName,
            corp_no: '',
            b_sector: data.businessType ?? '',
            b_type: data.businessModel ?? '',
            b_adr: '',
          },
        ],
      }),
    },
  );
  if (!reply.ok) throw new Error('사업자정보 진위확인 API 호출 실패');
  const result = (await reply.json()) as BusinessValidationResult;
  if (result.status_code !== 'OK') throw new Error(result.status_code);
  if (result.data[0].valid === '02') throw new Error(result.data[0].valid_msg);
  return result;
};
