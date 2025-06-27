import { env } from '@/env.js';
import { dayjs } from '@/lib/dayjs.js';
import iconv from 'iconv-lite';

const INICIS_MID = env.INICIS_MID;

function encode(str: string): string {
  const hexaString = iconv.encode(str, 'euc-kr').toString('hex');
  const chunks = hexaString.match(/.{1,2}/g);
  if (!chunks) return '';
  return chunks.map((chunk) => `%${chunk.toUpperCase()}`).join('');
}

function rawQueryString(obj: Record<string, string>) {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join('&');
}

export const registerSubMall = async (input: {
  partnerId: string;
  registrationNumber: string;
  serviceName: string;
  ceo: string;
  bankCode: string;
  accountOwner: string;
  accountNumber: string;
  phoneNumber: string;
}) => {
  const data = {
    id_merchant: INICIS_MID,
    id_mall: input.partnerId,
    cl_id: '2',
    no_comp: input.registrationNumber,
    nm_comp: encode(input.serviceName),
    nm_boss: encode(input.ceo),
    nm_regist: encode(input.accountOwner),
    cd_bank: input.bankCode,
    no_acct: input.accountNumber,
    no_tel: input.phoneNumber,
    cl_gubun: '1',
  };
  const res = await fetch(
    `https://iniweb.inicis.com/DefaultWebApp/mall/cr/open/OpMallUrlConnection.jsp?${rawQueryString(data)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'charset=EUC-KR' },
    },
  );
  if (!res.ok) throw new Error('가맹점 등록 요청에 실패했습니다.');
  const decoder = new TextDecoder('euc-kr');
  const arrayBuffer = await res.arrayBuffer();
  const decoded = decoder.decode(arrayBuffer);
  const result = decoded
    .replace(/\n|\r/g, '')
    .split('&')
    .reduce(
      (acc, v) => {
        const [key, value] = v.split('=');
        return { ...acc, [key]: value };
      },
      {} as {
        resultcode: string;
        resultmsg: string;
      },
    );
  if (result.resultcode !== '00' && result.resultcode !== '04')
    throw new Error(result.resultmsg);
  return result;
};

export const getWalletBalance = async (date: string) => {
  const data = {
    strIdMerchant: INICIS_MID,
    startDate: date,
    endDate: date,
  };
  const res = await fetch(
    `https://iniweb.inicis.com/service/open/remit_funds.jsp?${rawQueryString(data)}`,
    {
      method: 'GET',
      headers: {
        'Accept-charset': 'EUC-KR',
      },
    },
  );
  if (!res.ok) throw new Error('이니시스 잔액 조회에 실패했습니다.');
  const decoder = new TextDecoder('euc-kr');
  const arrayBuffer = await res.arrayBuffer();
  const decoded = decoder.decode(arrayBuffer);
  const result = decoded
    .replace(/\n|\r/g, '')
    .split('|')
    .reduce(
      (acc, value, index) => {
        if (index === 0) return { ...acc, mid: value };
        if (index === 1) return { ...acc, registrationNumber: value };
        if (index === 2) return { ...acc, requestDuration: value };
        return { ...acc, balance: Number(value) };
      },
      {
        mid: '',
        registrationNumber: '',
        requestDuration: '',
        balance: 0,
      },
    );
  return result;
};

export const payoutRequest = async (input: {
  storeId: string;
  payoutDate: string;
  registrationNumber: string;
  accountOwner: string;
  bankCode: string;
  accountNumber: string;
  payoutAmount: number;
}) => {
  const data = {
    id_merchant: INICIS_MID,
    id_mall: input.storeId,
    dt_pay: dayjs(input.payoutDate, 'YYYY-MM-DD').format('YYYYMMDD'),
    no_comp: input.registrationNumber,
    nm_regist: input.accountOwner,
    cd_bank: input.bankCode,
    no_acct: input.accountNumber,
    amt_supply: `${input.payoutAmount}`,
    cl_service: '0',
    cl_status: 'I',
  };
  const res = await fetch(
    `https://iniweb.inicis.com/DefaultWebApp/mall/cr/open/OpMallReqUrlConnection.jsp?${rawQueryString(data)}`,
    {
      method: 'GET',
      headers: {
        'Accept-charset': 'EUC-KR',
      },
    },
  );
  if (!res.ok) throw new Error('이니시스 지급 요청에 실패했습니다.');
  const decoder = new TextDecoder('euc-kr');
  const arrayBuffer = await res.arrayBuffer();
  const decoded = decoder.decode(arrayBuffer);
  const result = decoded
    .replace(/\n|\r/g, '')
    .split('&')
    .reduce(
      (acc, v) => {
        const [key, value] = v.split('=');
        return { ...acc, [key]: value };
      },
      {} as {
        resultcode: string;
        resultmsg: string;
      },
    );
  if (result.resultcode !== '00') throw new Error(result.resultmsg);
  return result;
};

export const getPayoutRequestResult = async (input: {
  date: string;
  storeId: string;
}) => {
  const data = {
    strReqNo: '1',
    strIdMerchant: INICIS_MID,
    startDate: input.date,
    endDate: input.date,
    subMerchant: input.storeId,
  };
  const res = await fetch(
    `https://iniweb.inicis.com/service/open/remit_result.jsp?${rawQueryString(data)}`,
    {
      method: 'GET',
      headers: {
        'Accept-charset': 'EUC-KR',
      },
    },
  );
  if (!res.ok) throw new Error('이니시스 지급 결과 요청에 실패했습니다.');
  const decoder = new TextDecoder('euc-kr');
  const arrayBuffer = await res.arrayBuffer();
  const decoded = decoder.decode(arrayBuffer);
  const result = decoded
    .replace(/\n|\r/g, '')
    .split('|')
    .reduce(
      (acc, value, index) => {
        if (index === 0)
          return { ...acc, type: value === '1' ? '지급내역' : '환불내역' };
        if (index === 1) return { ...acc, storeId: value };
        if (index === 2) return { ...acc, registrationNumber: value };
        if (index === 3) return { ...acc, serviceName: value };
        if (index === 4) return { ...acc, ceo: value };
        if (index === 5) return { ...acc, accountOwner: value };
        if (index === 6) return { ...acc, bankCode: value };
        if (index === 7) return { ...acc, accountNumber: value };
        if (index === 8) return { ...acc, phoneNumber: value };
        if (index === 9) return { ...acc, payoutdate: value };
        if (index === 10) return { ...acc, payoutAmount: Number(value) };
        if (index === 11) return { ...acc, pgPayoutDate: value };
        return { ...acc, resultCode: value };
      },
      {
        type: '',
        storeId: '',
        registrationNumber: '',
        serviceName: '',
        ceo: '',
        accountOwner: '',
        bankCode: '',
        accountNumber: '',
        phoneNumber: '',
        payoutdate: '',
        payoutAmount: 0,
        pgPayoutDate: '',
        resultCode: '',
      },
    );
  if (
    !result.resultCode &&
    result.resultCode !== '01' &&
    result.resultCode !== '02'
  )
    throw new Error('이니시스 지급 결과 조회에 실패했습니다.');
  return result;
};
