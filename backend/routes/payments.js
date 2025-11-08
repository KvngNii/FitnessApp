const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all payments for a client
router.get('/client/:clientId', (req, res) => {
  const { clientId } = req.params;

  const sql = `SELECT * FROM payments
               WHERE client_id = ?
               ORDER BY payment_date DESC`;

  db.all(sql, [clientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get upcoming payments (next payment due soon)
router.get('/upcoming', (req, res) => {
  const { days = 7 } = req.query;

  const sql = `SELECT p.*, c.name as client_name, c.email as client_email
               FROM payments p
               JOIN clients c ON p.client_id = c.id
               WHERE date(p.next_payment_date) <= date('now', '+' || ? || ' days')
               AND date(p.next_payment_date) >= date('now')
               AND p.status = 'paid'
               ORDER BY p.next_payment_date ASC`;

  db.all(sql, [days], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get overdue payments
router.get('/overdue', (req, res) => {
  const sql = `SELECT p.*, c.name as client_name, c.email as client_email
               FROM payments p
               JOIN clients c ON p.client_id = c.id
               WHERE date(p.next_payment_date) < date('now')
               AND p.status = 'paid'
               ORDER BY p.next_payment_date ASC`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add a new payment
router.post('/', (req, res) => {
  const {
    client_id,
    amount,
    next_payment_date,
    payment_frequency,
    payment_method,
    notes
  } = req.body;

  if (!client_id || !amount || !next_payment_date) {
    return res.status(400).json({ error: 'client_id, amount, and next_payment_date are required' });
  }

  const sql = `INSERT INTO payments
               (client_id, amount, next_payment_date, payment_frequency, payment_method, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    client_id,
    amount,
    next_payment_date,
    payment_frequency || 'monthly',
    payment_method,
    notes
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Payment recorded successfully' });
  });
});

// Update a payment
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    amount,
    payment_date,
    next_payment_date,
    payment_frequency,
    payment_method,
    notes,
    status
  } = req.body;

  const sql = `UPDATE payments
               SET amount = ?, payment_date = ?, next_payment_date = ?,
                   payment_frequency = ?, payment_method = ?, notes = ?, status = ?
               WHERE id = ?`;

  db.run(sql, [
    amount,
    payment_date,
    next_payment_date,
    payment_frequency,
    payment_method,
    notes,
    status,
    id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment updated successfully' });
  });
});

// Delete a payment
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM payments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  });
});

// Get payment statistics for a client
router.get('/stats/client/:clientId', (req, res) => {
  const { clientId } = req.params;

  const sql = `SELECT
                 COUNT(*) as total_payments,
                 SUM(amount) as total_paid,
                 AVG(amount) as average_payment,
                 MAX(payment_date) as last_payment_date,
                 MIN(next_payment_date) as next_due_date
               FROM payments
               WHERE client_id = ?`;

  db.get(sql, [clientId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(stats || {});
  });
});

module.exports = router;
