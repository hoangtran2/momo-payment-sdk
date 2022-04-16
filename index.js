const crypto = require('crypto');
const axios = require('axios');

class MomoPayment {
  constructor({ partnerCode, accessKey, secretKey, environment = 'sandbox' }) {
    this.partnerCode = partnerCode;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.environment = environment;
  }

  async createPayment({
    requestId,
    orderId,
    amount,
    orderInfo,
    returnUrl,
    notifyUrl,
    extraData = '',
  }) {
    const self = this;
    try {
      if (!orderId || !amount || !orderInfo || !returnUrl || !notifyUrl) {
        throw new Error('invalid input');
      }

      const url = this._getURL();
      const signatureRaw = `partnerCode=${self.partnerCode}&accessKey=${self.accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${returnUrl}&notifyUrl=${notifyUrl}&extraData=${extraData}`;
      const signature = crypto
        .createHmac('sha256', self.secretKey)
        .update(signatureRaw)
        .digest('hex');

      const res = await axios({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        url,
        data: {
          accessKey: self.accessKey,
          partnerCode: self.partnerCode,
          requestType: 'captureMoMoWallet',
          notifyUrl,
          returnUrl,
          orderId,
          amount,
          orderInfo,
          requestId,
          extraData,
          signature,
        },
      });
      return res;
    } catch (error) {
      console.error('error:', error)
      throw error;
    }
  }

  async refundPayment({
    requestId,
    orderId,
    amount,
    transId
  }) {
    const self = this;
    try {
      if (!orderId || !amount || !transId) {
        throw new Error('invalid input');
      }

      const url = this._getURL();
      const signatureRaw = `partnerCode=${self.partnerCode}&accessKey=${self.accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&transId=${transId}&requestType=refundMoMoWallet`;
      const signature = crypto
        .createHmac('sha256', self.secretKey)
        .update(signatureRaw)
        .digest('hex');

      const res = await axios({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        url,
        data: {
          accessKey: self.accessKey,
          partnerCode: self.partnerCode,
          requestType: 'refundMoMoWallet',
          orderId,
          amount,
          requestId,
          transId,
          signature
        },
      });
      return res;
    } catch (error) {
      console.error('error:', error)
      throw error;
    }
  }

  verifySignature({
    signature,
    requestId,
    orderId,
    amount,
    orderInfo,
    orderType,
    transId,
    message,
    localMessage,
    responseTime,
    errorCode,
    payType,
    extraData = '',
  }) {
    const self = this;

    try {
      if (
        !requestId ||
        !amount ||
        !orderId ||
        !orderInfo ||
        !orderType ||
        !transId ||
        !message ||
        !localMessage ||
        !responseTime ||
        !errorCode ||
        !payType
      ) {
        throw new Error('invalid input');
      }

      const signatureRaw = `partnerCode=${self.partnerCode}&accessKey=${self.accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&transId=${transId}&message=${message}&localMessage=${localMessage}&responseTime=${responseTime}&errorCode=${errorCode}&payType=${payType}&extraData=${extraData}`;

      const genSignature = crypto
        .createHmac('sha256', self.secretKey)
        .update(signatureRaw)
        .digest('hex');

      return genSignature === signature;
    } catch (error) {
      throw error;
    }
  }

  _getURL() {
    const self = this;
    if (self.environment === 'sandbox') {
      return 'https://test-payment.momo.vn/gw_payment/transactionProcessor';
    }

    if (self.environment === 'live') {
      return 'https://payment.momo.vn/gw_payment/transactionProcessor';
    }

    return false;
  }
}

module.exports = MomoPayment;
