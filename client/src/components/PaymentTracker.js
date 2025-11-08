import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';
import './PaymentTracker.css';

function PaymentTracker({ clientId, onPaymentAdded }) {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    next_payment_date: '',
    payment_frequency: 'monthly',
    payment_method: '',
    notes: '',
  });

  useEffect(() => {
    if (clientId) {
      loadPayments();
    }
  }, [clientId]);

  const loadPayments = async () => {
    try {
      const response = await paymentAPI.getAll(clientId);
      setPayments(response.data);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentAPI.create({
        client_id: clientId,
        ...formData,
      });
      setShowModal(false);
      setFormData({
        amount: '',
        next_payment_date: '',
        payment_frequency: 'monthly',
        payment_method: '',
        notes: '',
      });
      loadPayments();
      if (onPaymentAdded) onPaymentAdded();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  };

  const calculateDaysUntilPayment = (nextPaymentDate) => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    const diffTime = paymentDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatus = (daysUntil) => {
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'due-soon';
    return 'upcoming';
  };

  return (
    <div className="payment-tracker">
      <div className="section-header">
        <h2>Payment Tracking</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          Add Payment
        </button>
      </div>

      {payments.length === 0 ? (
        <p>No payment records found.</p>
      ) : (
        <div className="payments-list">
          {payments.map((payment) => {
            const daysUntil = calculateDaysUntilPayment(payment.next_payment_date);
            const status = getPaymentStatus(daysUntil);

            return (
              <div key={payment.id} className={`payment-card ${status}`}>
                <div className="payment-header">
                  <div className="payment-amount">${payment.amount}</div>
                  <div className={`payment-status ${status}`}>
                    {status === 'overdue' && 'OVERDUE'}
                    {status === 'due-soon' && 'DUE SOON'}
                    {status === 'upcoming' && 'UPCOMING'}
                  </div>
                </div>

                <div className="payment-details">
                  <div className="payment-countdown">
                    {daysUntil < 0 ? (
                      <span className="countdown-text">
                        {Math.abs(daysUntil)} days overdue
                      </span>
                    ) : (
                      <span className="countdown-text">
                        {daysUntil} days until next payment
                      </span>
                    )}
                  </div>

                  <div className="payment-info">
                    <p><strong>Next Payment:</strong> {new Date(payment.next_payment_date).toLocaleDateString()}</p>
                    <p><strong>Frequency:</strong> {payment.payment_frequency}</p>
                    {payment.payment_method && (
                      <p><strong>Method:</strong> {payment.payment_method}</p>
                    )}
                    {payment.notes && <p><strong>Notes:</strong> {payment.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Payment Record</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Next Payment Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.next_payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, next_payment_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Frequency</label>
                <select
                  className="form-control"
                  value={formData.payment_frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_frequency: e.target.value })
                  }
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                  placeholder="e.g., Cash, Card, Bank Transfer"
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Payment</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentTracker;
