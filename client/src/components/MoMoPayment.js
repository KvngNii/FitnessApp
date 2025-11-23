import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MoMoPayment.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MoMoPayment({ clientId, clientName, onPaymentSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    phone_number: '',
    payer_message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (clientId) {
      loadTransactions();
    }
  }, [clientId]);

  const loadTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/momo/transactions/client/${clientId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // If starts with 0, replace with 233
    if (digits.startsWith('0')) {
      return '233' + digits.substring(1);
    }

    // If doesn't start with 233, add it
    if (!digits.startsWith('233')) {
      return '233' + digits;
    }

    return digits;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      setFormData({
        ...formData,
        [name]: formatPhoneNumber(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate phone number
      if (!formData.phone_number.match(/^233\d{9}$/)) {
        setError('Invalid phone number. Must be 10 digits (e.g., 0244123456)');
        setLoading(false);
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/momo/request-payment`, {
        client_id: clientId,
        amount: parseFloat(formData.amount),
        phone_number: formData.phone_number,
        payer_message: formData.payer_message || `FitWithNii - Payment for ${clientName}`,
        payee_note: `Payment from ${clientName}`,
      });

      if (response.data.success) {
        setSuccess('Payment request sent! Client will receive a prompt on their phone.');
        setTransactionId(response.data.reference_id);
        setFormData({
          amount: '',
          phone_number: '',
          payer_message: '',
        });

        // Start checking status after 5 seconds
        setTimeout(() => {
          checkTransactionStatus(response.data.reference_id);
        }, 5000);

        loadTransactions();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const checkTransactionStatus = async (referenceId) => {
    setCheckingStatus(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/momo/transaction/${referenceId}`);

      if (response.data.success) {
        const status = response.data.transaction.status;

        if (status === 'SUCCESSFUL') {
          setSuccess('Payment completed successfully!');
          setTransactionId(null);
          loadTransactions();
          if (onPaymentSuccess) onPaymentSuccess();
        } else if (status === 'FAILED') {
          setError('Payment failed. Please try again.');
          setTransactionId(null);
        } else if (status === 'PENDING') {
          // Check again in 5 seconds
          setTimeout(() => {
            checkTransactionStatus(referenceId);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <div className="momo-payment">
      <div className="section-header">
        <h2>💳 MTN Mobile Money Payments</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          Request Payment
        </button>
      </div>

      {transactions.length > 0 && (
        <div className="transactions-list">
          <h3>Recent Transactions</h3>
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <span className="transaction-amount">GH₵ {transaction.amount}</span>
                <span className="transaction-phone">{transaction.phone_number}</span>
              </div>
              <div className="transaction-meta">
                <span className={`status-badge ${getStatusBadgeClass(transaction.status)}`}>
                  {transaction.status}
                </span>
                <span className="transaction-date">
                  {new Date(transaction.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Request MTN MoMo Payment</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setError('');
                setSuccess('');
              }}>
                &times;
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                {success}
                {checkingStatus && (
                  <div className="checking-status">
                    <div className="spinner"></div>
                    Checking payment status...
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount (GH₵) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  disabled={loading || transactionId}
                />
              </div>

              <div className="form-group">
                <label>Client's Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  name="phone_number"
                  placeholder="0244123456"
                  required
                  disabled={loading || transactionId}
                />
                <small className="form-text">
                  Enter 10-digit number starting with 0 (e.g., 0244123456)
                </small>
              </div>

              <div className="form-group">
                <label>Message to Client (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.payer_message}
                  onChange={(e) =>
                    setFormData({ ...formData, payer_message: e.target.value })
                  }
                  placeholder="FitWithNii - Training Payment"
                  disabled={loading || transactionId}
                />
              </div>

              <div className="momo-info">
                <h4>How it works:</h4>
                <ol>
                  <li>Click "Send Payment Request"</li>
                  <li>Client receives a prompt on their phone</li>
                  <li>Client enters their MoMo PIN to approve</li>
                  <li>Payment is processed instantly</li>
                  <li>Both parties receive confirmation</li>
                </ol>
              </div>

              <div className="form-actions">
                {!transactionId ? (
                  <>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Sending Request...' : 'Send Payment Request'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        setError('');
                        setSuccess('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setTransactionId(null);
                      setSuccess('');
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MoMoPayment;
