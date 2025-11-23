# MTN Mobile Money (MoMo) Integration Setup Guide

This guide will help you set up MTN Mobile Money payments for FitWithNii in Ghana.

## Overview

The MTN MoMo integration allows you to:
- Request payments directly from clients' MTN MoMo accounts
- Receive payments straight to your MTN MoMo number
- Track all transactions in real-time
- Automatic payment status updates

## Prerequisites

1. **MTN MoMo Account**: Active MTN MoMo account registered in Ghana
2. **MTN Developer Account**: Account on [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
3. **Business Verification**: Your business/personal details verified by MTN

## Step 1: Register on MTN MoMo Developer Portal

1. Visit [https://momodeveloper.mtn.com/](https://momodeveloper.mtn.com/)
2. Click **"Sign Up"** or **"Register"**
3. Fill in your details:
   - Email address
   - Password
   - First and Last Name
4. Verify your email address
5. Log in to your developer account

## Step 2: Subscribe to Collection API

1. Once logged in, go to **"Products"**
2. Find **"Collection"** product (this is for receiving payments)
3. Click **"Subscribe"**
4. You will receive two subscription keys:
   - **Primary Key** (use this one)
   - **Secondary Key** (backup)
5. Copy and save your **Primary Subscription Key**

## Step 3: Create API User and API Key

### For Sandbox (Testing)

Use the provided sandbox tools or make API calls:

```bash
# Create API User
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H 'X-Reference-Id: YOUR_UUID_HERE' \
  -H 'Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "providerCallbackHost": "your-callback-url.com"
  }'

# Create API Key
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/YOUR_UUID/apikey \
  -H 'Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY'
```

You'll receive:
- **API User** (UUID format)
- **API Key** (string)

### For Production

1. Contact MTN to move from Sandbox to Production
2. Provide business documentation
3. Complete KYC verification
4. Receive production API credentials

## Step 4: Configure FitWithNii

1. Navigate to your FitnessApp folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file and add your credentials:

```env
PORT=5000
NODE_ENV=development

# MTN MoMo Configuration
MOMO_ENVIRONMENT=sandbox
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_COLLECTION_SUBSCRIPTION_KEY=your_subscription_key_from_step_2
MOMO_API_USER=your_api_user_uuid_from_step_3
MOMO_API_KEY=your_api_key_from_step_3
MOMO_CALLBACK_URL=http://your-domain.com/api/momo/callback
```

### For Production:
```env
MOMO_ENVIRONMENT=production
MOMO_BASE_URL=https://momodeveloper.mtn.com
# Use production credentials...
```

## Step 5: Install Dependencies

```bash
npm install
```

New dependencies added:
- `axios` - For API calls
- `uuid` - For generating transaction IDs

## Step 6: Test the Integration

### Using Sandbox

MTN provides sandbox test numbers:

**Test Scenarios:**

1. **Successful Payment**:
   - Phone: `233XXXXXXXXX` (any valid format)
   - Amount: Any amount
   - Status: Will succeed automatically in sandbox

2. **Failed Payment**:
   - Use specific test numbers provided by MTN for failed scenarios

### Testing Steps:

1. Start your server:
   ```bash
   npm start
   ```

2. Start your frontend:
   ```bash
   cd client
   npm start
   ```

3. Navigate to a client's profile
4. Scroll to "MTN Mobile Money Payments" section
5. Click "Request Payment"
6. Enter:
   - Amount (e.g., 50.00 GH₵)
   - Phone number (e.g., 0244123456)
   - Optional message
7. Click "Send Payment Request"

8. In sandbox mode:
   - Payment is automatically approved
   - Status changes to "SUCCESSFUL" within seconds
   - Check transactions list to see completed payment

## Step 7: Understanding the Payment Flow

1. **Request Payment**:
   - You enter client's phone and amount
   - System sends request to MTN MoMo API
   - Transaction recorded as "PENDING"

2. **Client Receives Prompt**:
   - Client gets MTN MoMo prompt on their phone
   - Shows amount and your message
   - Client enters their MoMo PIN

3. **Payment Processing**:
   - MTN processes the payment
   - Money transfers to your MoMo account
   - Status updates to "SUCCESSFUL"

4. **Confirmation**:
   - Both you and client receive SMS confirmation
   - Payment record automatically created
   - Next payment date calculated

## Step 8: Going Live (Production)

### Requirements:

1. **Business Registration**:
   - Business registration certificate
   - Tax Identification Number (TIN)
   - Business owner's Ghana Card

2. **MTN Verification**:
   - Submit documents to MTN
   - Wait for approval (1-2 weeks)
   - Complete compliance checks

3. **Update Configuration**:
   ```env
   MOMO_ENVIRONMENT=production
   MOMO_BASE_URL=https://momodeveloper.mtn.com
   # Use production credentials
   ```

4. **Deploy Application**:
   - Deploy to a server with HTTPS
   - Update callback URL to your domain
   - Test with real transactions

### Production Checklist:

- [ ] Business documents verified
- [ ] Production API credentials obtained
- [ ] Application deployed with HTTPS
- [ ] Callback URL configured correctly
- [ ] Test transaction completed successfully
- [ ] Error handling tested
- [ ] Client notification system working

## API Endpoints

### Request Payment
```
POST /api/momo/request-payment
{
  "client_id": 1,
  "amount": 100.00,
  "phone_number": "233244123456",
  "payer_message": "Training payment",
  "payee_note": "Payment from John Doe"
}
```

### Check Transaction Status
```
GET /api/momo/transaction/:referenceId
```

### Get Client Transactions
```
GET /api/momo/transactions/client/:clientId
```

### Validate Phone Number
```
POST /api/momo/validate-phone
{
  "phone_number": "0244123456"
}
```

### Get Account Balance
```
GET /api/momo/balance
```

## Transaction Statuses

- **PENDING**: Payment request sent, waiting for client approval
- **SUCCESSFUL**: Payment completed and confirmed
- **FAILED**: Payment failed (insufficient funds, cancelled, etc.)

## Phone Number Format

Accepted formats (automatically converted):
- `0244123456` → `233244123456`
- `244123456` → `233244123456`
- `233244123456` → `233244123456` (preferred)

## Security Best Practices

1. **Keep Credentials Secret**:
   - Never commit `.env` file to git
   - Use environment variables in production
   - Rotate API keys periodically

2. **Validate Input**:
   - Always validate phone numbers
   - Check amount limits
   - Sanitize user input

3. **Monitor Transactions**:
   - Set up alerts for failed payments
   - Monitor unusual activity
   - Keep transaction logs

4. **Use HTTPS**:
   - Always use HTTPS in production
   - Secure webhook endpoints
   - Validate webhook signatures

## Troubleshooting

### Common Issues:

1. **"Invalid Subscription Key"**:
   - Check if you copied the correct subscription key
   - Ensure no extra spaces in `.env` file
   - Verify you're using Primary key, not Secondary

2. **"API User not found"**:
   - Ensure API User was created successfully
   - Check if UUID is correct
   - Try creating a new API User

3. **"Phone number not registered"**:
   - Client must have active MTN MoMo account
   - Phone number must be correct format
   - Verify client can receive MoMo payments

4. **"Payment always pending"**:
   - In sandbox, payments should auto-complete
   - Check sandbox vs production environment
   - Verify callback URL is accessible

5. **"Callback not received"**:
   - Ensure callback URL is publicly accessible
   - Check firewall settings
   - Verify HTTPS is enabled

### Getting Help:

- **MTN Support**: Contact MTN MoMo support for API issues
- **Developer Forum**: [MTN Developer Community](https://momodeveloper.mtn.com/community)
- **Email**: support@mtnmomo.com

## Cost Structure

### Sandbox:
- **Free**: Unlimited test transactions

### Production:
- **Transaction Fees**: Check with MTN for current rates
- **Typical fees**: 0-2% depending on agreement
- **No setup fees** for most merchants

## Features

### Implemented:
- ✅ Payment requests
- ✅ Transaction status checking
- ✅ Phone number validation
- ✅ Transaction history
- ✅ Automatic payment records
- ✅ Real-time status updates

### Coming Soon:
- 📧 Email notifications
- 📱 SMS notifications
- 📊 Payment analytics dashboard
- 🔄 Recurring payments setup
- 💵 Refund processing

## Example Usage in UI

1. **Request Payment**:
   - Go to client profile
   - Click "Request Payment" in MoMo section
   - Enter amount and phone number
   - Client receives instant prompt

2. **Track Payment**:
   - Status updates automatically
   - View in "Recent Transactions"
   - Payment recorded when successful

3. **View History**:
   - See all past MoMo transactions
   - Filter by status
   - Export for accounting

## Support

For technical support:
- **FitWithNii Issues**: Open an issue on GitHub
- **MTN MoMo API**: Contact MTN Developer Support
- **Integration Help**: Check documentation at momodeveloper.mtn.com

## Resources

- [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
- [API Documentation](https://momodeveloper.mtn.com/api-documentation)
- [Sandbox Tools](https://momodeveloper.mtn.com/tools)
- [FAQs](https://momodeveloper.mtn.com/faq)

---

**Ready to accept payments!** 💰📱

Once set up, your clients can pay instantly via MTN Mobile Money, and the money goes straight to your registered MTN MoMo account.
