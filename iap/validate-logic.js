const iapGoogle = require('./google');
const iapApple = require('./apple');

const validateIAP = async (iap) => {
  if (iap.platform === 'google') {
    const { productId, purchaseToken } = iap;
    const accessToken = await iapGoogle.getAccessToken();
    const receipt = await iapGoogle.getProductReceipt(productId, accessToken, purchaseToken);
    if (!receipt)
      return { status: 400, message: '결제 검증에 실패했습니다.' };
    if (receipt.cancelReason)
      return { status: 400, message: '취소처리된 주문입니다.' };
    const orderId = receipt.orderId;
    if (!orderId)
      return { status: 400, message: '주문 ID가 없습니다.' };
    const paymentState = receipt.paymentState;
    if (paymentState === 0)
      return { status: 400, message: '결제가 보류된 상태입니다.' };
    const duplicateCheck = await DuplicateFunction(orderId);
    if (duplicateCheck) {
      return { status: 400, message: '이미 처리된 주문입니다.' };
    }
    return { status: 200, message: '결제 검증 성공', receipt };
  }
  else if (iap.platform === 'apple') {
    const { receipt } = iap;
    const verifiedReceipt = await iapApple.verifyReceipt(receipt);
    const { status, latestReceiptInfo } = verifiedReceipt;
    if (status !== 0) {
      return { status: 400, message: '애플 결제 검증에 실패했습니다.' };
    }
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return { status: 400, message: '애플 결제 정보가 없습니다.' };
    }
    const latestInfo = latestReceiptInfo[latestReceiptInfo.length - 1];
    const orderId = latestInfo.originalTransactionId || latestInfo.transactionId;
    if (!orderId) {
      return { status: 400, message: '주문 ID가 없습니다.' };
    }
    const duplicateCheck = await DuplicateFunction(orderId);
    if (duplicateCheck) {
      return { status: 400, message: '이미 처리된 주문입니다.' };
    }
    return {
      status: 200, message: '애플 결제 검증 성공',
      receipt: {
        orderId,
      }
    };
  }
  else {
    throw new Error('Unsupported platform');
  }
}