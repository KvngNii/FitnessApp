const express = require('express');
const router = express.Router();
const db = require('../database');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get all clients
router.get('/', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single client by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(row);
  });
});

// Create a new client
router.post('/', (req, res) => {
  const { name, email, phone, date_of_birth, gender, goals, notes } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const sql = `INSERT INTO clients (name, email, phone, date_of_birth, gender, goals, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, email, phone, date_of_birth, gender, goals, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Client created successfully' });
  });
});

// Update a client
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, date_of_birth, gender, goals, notes } = req.body;

  const sql = `UPDATE clients
               SET name = ?, email = ?, phone = ?, date_of_birth = ?,
                   gender = ?, goals = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [name, email, phone, date_of_birth, gender, goals, notes, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client updated successfully' });
  });
});

// Delete a client
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  });
});

// Get client's assigned workouts
router.get('/:id/workouts', (req, res) => {
  const { id } = req.params;

  const sql = `SELECT cw.*, w.name, w.description, w.difficulty, w.duration_minutes
               FROM client_workouts cw
               JOIN workouts w ON cw.workout_id = w.id
               WHERE cw.client_id = ?
               ORDER BY cw.assigned_date DESC`;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Assign a workout to a client
router.post('/:id/workouts', (req, res) => {
  const { id } = req.params;
  const { workout_id } = req.body;

  if (!workout_id) {
    return res.status(400).json({ error: 'workout_id is required' });
  }

  const sql = `INSERT INTO client_workouts (client_id, workout_id) VALUES (?, ?)`;

  db.run(sql, [id, workout_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Workout assigned successfully' });
  });
});

// Upload profile picture for a client
router.post('/:id/profile-picture', upload.single('profile_picture'), (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

  // Get old profile picture to delete it
  db.get('SELECT profile_picture FROM clients WHERE id = ?', [id], (err, client) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!client) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Client not found' });
    }

    // Update client with new profile picture
    const sql = `UPDATE clients SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(sql, [profilePicturePath, id], function(err) {
      if (err) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: err.message });
      }

      // Delete old profile picture if it exists
      if (client.profile_picture) {
        const oldPicturePath = path.join(__dirname, '..', client.profile_picture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }

      res.json({
        message: 'Profile picture uploaded successfully',
        profile_picture: profilePicturePath
      });
    });
  });
});

// Delete profile picture
router.delete('/:id/profile-picture', (req, res) => {
  const { id } = req.params;

  db.get('SELECT profile_picture FROM clients WHERE id = ?', [id], (err, client) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (!client.profile_picture) {
      return res.status(400).json({ error: 'Client has no profile picture' });
    }

    // Delete the file
    const picturePath = path.join(__dirname, '..', client.profile_picture);
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    // Update database
    const sql = `UPDATE clients SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(sql, [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Profile picture deleted successfully' });
    });
  });
});

module.exports = router;
