const axios = require('axios');
const { GoogleToken } = require('gtoken');
const path = require('path');
const PACKAGE_NAME = 'package.name.here';

const gtoken = new GoogleToken({
  keyFile: path.join(__dirname, '../../key_file_location.json'),
  scope: ['https://www.googleapis.com/auth/androidpublisher'] // or space-delimited string of scopes
});
const iapGoogle = {
  async getAccessToken() {
    const token = await gtoken.getToken();
    return token;
  },
  async getProductReceipt(productId, accessToken, purchaseToken) {
    try {
      const response = await axios({
        method: 'GET',
        url: `https://www.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      const receipt = response.data
      return receipt;
    }
    catch (err) {
      throw new Error(err);
    }
  },
  async getVoidedPurchaseList() {
    const atoken = await this.getAccessToken();
    try {
      const response = await axios({
        method: 'GET',
        url: `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/voidedpurchases`,
        headers: {
          'Authorization': `Bearer ${atoken.access_token}`
        }
      })
      const result = response.data;
      return result;
    }
    catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = iapGoogle;