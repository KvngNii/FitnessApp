const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all exercises
router.get('/', (req, res) => {
  const { category, muscle_group } = req.query;
  let sql = 'SELECT * FROM exercises';
  const params = [];

  if (category || muscle_group) {
    sql += ' WHERE';
    if (category) {
      sql += ' category = ?';
      params.push(category);
    }
    if (muscle_group) {
      sql += category ? ' AND muscle_group = ?' : ' muscle_group = ?';
      params.push(muscle_group);
    }
  }

  sql += ' ORDER BY name';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single exercise
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM exercises WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(row);
  });
});

// Create a new exercise
router.post('/', (req, res) => {
  const { name, description, category, muscle_group, equipment, video_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Exercise name is required' });
  }

  const sql = `INSERT INTO exercises (name, description, category, muscle_group, equipment, video_url)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, description, category, muscle_group, equipment, video_url], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Exercise created successfully' });
  });
});

// Update an exercise
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, muscle_group, equipment, video_url } = req.body;

  const sql = `UPDATE exercises
               SET name = ?, description = ?, category = ?, muscle_group = ?,
                   equipment = ?, video_url = ?
               WHERE id = ?`;

  db.run(sql, [name, description, category, muscle_group, equipment, video_url, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json({ message: 'Exercise updated successfully' });
  });
});

// Delete an exercise
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM exercises WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json({ message: 'Exercise deleted successfully' });
  });
});

module.exports = router;
