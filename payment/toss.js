const axios = require('axios');
const access_token = Buffer.from(`${process.env.TOSS_SECRET}:`, 'binary').toString('base64');

module.exports = {
  //빌링키 발급하기
  async issue(authKey, customerKey) {
    const response = await axios({
      method: 'POST',
      url: 'https://api.tosspayments.com/v1/billing/authorizations/issue',
      headers: {
        "Authorization": `Basic ${access_token}`,
        "Content-Type": "application/json"
      },
      data: {
        authKey,
        customerKey
      }
    })
    return response.data;
  },

  //자동결제 승인하기
  async renew(billingKey, customerKey, orderData) {
    const response = await axios({
      method: 'POST',
      url: `https://api.tosspayments.com/v1/billing/${billingKey}`,
      headers: {
        "Authorization": `Basic ${access_token}`,
        "Content-Type": "application/json"
      },
      data: {
        customerKey,
        orderId: orderData.orderId,
        orderName: orderData.orderName,
        amount: orderData.amount,
      }
    })
    return response.data;
  },

  async cancel(paymentKey, cancelReason) {
    const response = await axios({
      method: 'POST',
      url: `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      headers: {
        "Authorization": `Basic ${access_token}`
      },
      data: {
        cancelReason
      }
    });
    return response.data;
  }
}