const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class MoMoService {
  constructor() {
    // MTN MoMo API Configuration
    this.baseURL = process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
    this.environment = process.env.MOMO_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'
    this.subscriptionKey = process.env.MOMO_COLLECTION_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MOMO_API_USER;
    this.apiKey = process.env.MOMO_API_KEY;
    this.callbackUrl = process.env.MOMO_CALLBACK_URL || 'http://localhost:5000/api/momo/callback';
    this.currency = 'GHS'; // Ghana Cedis
  }

  /**
   * Get access token for MTN MoMo API
   */
  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');

      const response = await axios.post(
        `${this.baseURL}/collection/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting MoMo access token:', error.response?.data || error.message);
      throw new Error('Failed to get MTN MoMo access token');
    }
  }

  /**
   * Request payment from a client
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.amount - Amount to collect
   * @param {string} paymentData.phoneNumber - Client's phone number (format: 233XXXXXXXXX)
   * @param {string} paymentData.externalId - Your internal payment ID
   * @param {string} paymentData.payerMessage - Message to show the payer
   * @param {string} paymentData.payeeNote - Note for your records
   */
  async requestToPay(paymentData) {
    try {
      const accessToken = await this.getAccessToken();
      const referenceId = uuidv4(); // Generate unique reference ID

      const requestData = {
        amount: paymentData.amount.toString(),
        currency: this.currency,
        externalId: paymentData.externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: paymentData.phoneNumber,
        },
        payerMessage: paymentData.payerMessage || 'FitWithNii Payment',
        payeeNote: paymentData.payeeNote || 'Fitness training payment',
      };

      const response = await axios.post(
        `${this.baseURL}/collection/v1_0/requesttopay`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json',
            'X-Callback-Url': this.callbackUrl,
          },
        }
      );

      return {
        success: true,
        referenceId: referenceId,
        message: 'Payment request sent successfully',
      };
    } catch (error) {
      console.error('Error requesting payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
        message: 'Failed to initiate payment',
      };
    }
  }

  /**
   * Check payment status
   * @param {string} referenceId - The reference ID from requestToPay
   */
  async getTransactionStatus(referenceId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error checking transaction status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance() {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/account/balance`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );

      return {
        success: true,
        balance: response.data,
      };
    } catch (error) {
      console.error('Error getting account balance:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Validate account holder (check if phone number is registered with MoMo)
   * @param {string} phoneNumber - Phone number to validate
   */
  async validateAccountHolder(phoneNumber) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': this.environment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );

      return {
        success: true,
        isValid: response.data.result,
      };
    } catch (error) {
      console.error('Error validating account:', error.response?.data || error.message);
      return {
        success: false,
        isValid: false,
        error: error.response?.data || error.message,
      };
    }
  }
}

module.exports = new MoMoService();
