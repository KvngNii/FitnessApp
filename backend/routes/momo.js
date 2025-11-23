const express = require('express');
const router = express.Router();
const db = require('../database');
const momoService = require('../services/momoService');

// Initiate payment request
router.post('/request-payment', async (req, res) => {
  const { client_id, amount, phone_number, payer_message, payee_note } = req.body;

  if (!client_id || !amount || !phone_number) {
    return res.status(400).json({
      error: 'client_id, amount, and phone_number are required'
    });
  }

  try {
    // Validate phone number format (should be 233XXXXXXXXX for Ghana)
    const cleanPhone = phone_number.replace(/\s+/g, '');
    if (!cleanPhone.match(/^233\d{9}$/)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Use format: 233XXXXXXXXX'
      });
    }

    // Check if account holder is valid
    const validation = await momoService.validateAccountHolder(cleanPhone);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Phone number is not registered with MTN MoMo'
      });
    }

    // Generate external ID (our internal reference)
    const externalId = `FWN-${Date.now()}-${client_id}`;

    // Request payment from MoMo
    const paymentResult = await momoService.requestToPay({
      amount: amount,
      phoneNumber: cleanPhone,
      externalId: externalId,
      payerMessage: payer_message || 'FitWithNii - Fitness Training Payment',
      payeeNote: payee_note || `Payment from client ID: ${client_id}`,
    });

    if (!paymentResult.success) {
      return res.status(500).json({
        error: 'Failed to initiate payment',
        details: paymentResult.error
      });
    }

    // Save transaction to database
    const sql = `INSERT INTO momo_transactions
                 (client_id, amount, phone_number, reference_id, external_id, status, payer_message, payee_note)
                 VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`;

    db.run(sql, [
      client_id,
      amount,
      cleanPhone,
      paymentResult.referenceId,
      externalId,
      payer_message || 'FitWithNii - Fitness Training Payment',
      payee_note || `Payment from client ID: ${client_id}`
    ], function(err) {
      if (err) {
        console.error('Error saving transaction:', err);
        return res.status(500).json({ error: 'Failed to save transaction' });
      }

      res.status(201).json({
        success: true,
        message: 'Payment request sent. Client will receive a prompt on their phone.',
        transaction_id: this.lastID,
        reference_id: paymentResult.referenceId,
        external_id: externalId
      });
    });
  } catch (error) {
    console.error('Error processing payment request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check payment status
router.get('/transaction/:referenceId', async (req, res) => {
  const { referenceId } = req.params;

  try {
    // Get status from MoMo API
    const statusResult = await momoService.getTransactionStatus(referenceId);

    if (!statusResult.success) {
      return res.status(500).json({
        error: 'Failed to check transaction status',
        details: statusResult.error
      });
    }

    const transactionData = statusResult.data;

    // Update database with current status
    const updateSql = `UPDATE momo_transactions
                       SET status = ?,
                           financial_transaction_id = ?,
                           reason = ?,
                           updated_at = CURRENT_TIMESTAMP
                       WHERE reference_id = ?`;

    db.run(updateSql, [
      transactionData.status,
      transactionData.financialTransactionId || null,
      transactionData.reason || null,
      referenceId
    ], function(err) {
      if (err) {
        console.error('Error updating transaction:', err);
      }
    });

    // If payment is successful, create a payment record
    if (transactionData.status === 'SUCCESSFUL') {
      db.get('SELECT * FROM momo_transactions WHERE reference_id = ?', [referenceId], (err, transaction) => {
        if (!err && transaction && !transaction.payment_id) {
          // Calculate next payment date (30 days from now for monthly)
          const nextPaymentDate = new Date();
          nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

          const paymentSql = `INSERT INTO payments
                              (client_id, amount, payment_method, status, next_payment_date, payment_frequency, notes)
                              VALUES (?, ?, 'MTN MoMo', 'paid', ?, 'monthly', ?)`;

          db.run(paymentSql, [
            transaction.client_id,
            transaction.amount,
            nextPaymentDate.toISOString(),
            `MoMo Reference: ${referenceId}`
          ], function(err) {
            if (!err) {
              // Link the payment to the transaction
              db.run('UPDATE momo_transactions SET payment_id = ? WHERE reference_id = ?',
                [this.lastID, referenceId]);
            }
          });
        }
      });
    }

    res.json({
      success: true,
      transaction: transactionData
    });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all transactions for a client
router.get('/transactions/client/:clientId', (req, res) => {
  const { clientId } = req.params;

  const sql = `SELECT * FROM momo_transactions
               WHERE client_id = ?
               ORDER BY created_at DESC`;

  db.all(sql, [clientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Webhook callback for payment notifications
router.post('/callback', async (req, res) => {
  try {
    console.log('MoMo Callback received:', req.body);

    const { referenceId, status } = req.body;

    if (referenceId) {
      // Update transaction status
      const updateSql = `UPDATE momo_transactions
                         SET status = ?,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE reference_id = ?`;

      db.run(updateSql, [status || 'completed', referenceId], (err) => {
        if (err) {
          console.error('Error updating transaction from callback:', err);
        }
      });
    }

    // Always return 200 OK to acknowledge receipt
    res.status(200).json({ message: 'Callback received' });
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(200).json({ message: 'Callback received' });
  }
});

// Get account balance
router.get('/balance', async (req, res) => {
  try {
    const balanceResult = await momoService.getAccountBalance();

    if (!balanceResult.success) {
      return res.status(500).json({
        error: 'Failed to get account balance',
        details: balanceResult.error
      });
    }

    res.json({
      success: true,
      balance: balanceResult.balance
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate phone number
router.post('/validate-phone', async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: 'phone_number is required' });
  }

  try {
    const cleanPhone = phone_number.replace(/\s+/g, '');

    if (!cleanPhone.match(/^233\d{9}$/)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid phone number format. Use format: 233XXXXXXXXX'
      });
    }

    const validation = await momoService.validateAccountHolder(cleanPhone);

    res.json({
      valid: validation.isValid,
      phone_number: cleanPhone
    });
  } catch (error) {
    console.error('Error validating phone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
