const express = require('express');
const router = express.Router();
const db = require('../database');

// Log a completed workout
router.post('/workout-logs', (req, res) => {
  const { client_id, workout_id, duration_minutes, notes, rating, exercises } = req.body;

  if (!client_id || !workout_id) {
    return res.status(400).json({ error: 'client_id and workout_id are required' });
  }

  const sql = `INSERT INTO workout_logs (client_id, workout_id, duration_minutes, notes, rating)
               VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [client_id, workout_id, duration_minutes, notes, rating], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const workoutLogId = this.lastID;

    // Add exercise logs if provided
    if (exercises && exercises.length > 0) {
      const stmt = db.prepare(`INSERT INTO exercise_logs
                               (workout_log_id, exercise_id, sets_completed, reps_completed, weight_used, duration_seconds, notes)
                               VALUES (?, ?, ?, ?, ?, ?, ?)`);

      exercises.forEach((exercise) => {
        stmt.run([
          workoutLogId,
          exercise.exercise_id,
          exercise.sets_completed,
          exercise.reps_completed,
          exercise.weight_used,
          exercise.duration_seconds,
          exercise.notes
        ]);
      });

      stmt.finalize();
    }

    res.status(201).json({ id: workoutLogId, message: 'Workout logged successfully' });
  });
});

// Get workout logs for a client
router.get('/workout-logs/client/:clientId', (req, res) => {
  const { clientId } = req.params;
  const { limit = 10 } = req.query;

  const sql = `SELECT wl.*, w.name as workout_name, w.description as workout_description
               FROM workout_logs wl
               JOIN workouts w ON wl.workout_id = w.id
               WHERE wl.client_id = ?
               ORDER BY wl.completed_date DESC
               LIMIT ?`;

  db.all(sql, [clientId, limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a specific workout log with exercise details
router.get('/workout-logs/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM workout_logs WHERE id = ?', [id], (err, log) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!log) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    // Get exercise logs
    const sql = `SELECT el.*, e.name as exercise_name
                 FROM exercise_logs el
                 JOIN exercises e ON el.exercise_id = e.id
                 WHERE el.workout_log_id = ?`;

    db.all(sql, [id], (err, exercises) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      log.exercises = exercises;
      res.json(log);
    });
  });
});

// Add body measurements
router.post('/measurements', (req, res) => {
  const {
    client_id, weight, height, body_fat_percentage,
    chest, waist, hips, bicep_left, bicep_right,
    thigh_left, thigh_right, notes
  } = req.body;

  if (!client_id) {
    return res.status(400).json({ error: 'client_id is required' });
  }

  const sql = `INSERT INTO body_measurements
               (client_id, weight, height, body_fat_percentage, chest, waist, hips,
                bicep_left, bicep_right, thigh_left, thigh_right, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    client_id, weight, height, body_fat_percentage,
    chest, waist, hips, bicep_left, bicep_right,
    thigh_left, thigh_right, notes
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Measurements recorded successfully' });
  });
});

// Get body measurements for a client
router.get('/measurements/client/:clientId', (req, res) => {
  const { clientId } = req.params;
  const { limit = 10 } = req.query;

  const sql = `SELECT * FROM body_measurements
               WHERE client_id = ?
               ORDER BY date DESC
               LIMIT ?`;

  db.all(sql, [clientId, limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get progress statistics for a client
router.get('/stats/client/:clientId', (req, res) => {
  const { clientId } = req.params;

  // Get workout count
  db.get('SELECT COUNT(*) as total_workouts FROM workout_logs WHERE client_id = ?',
    [clientId],
    (err, workoutStats) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get latest measurement
      db.get('SELECT * FROM body_measurements WHERE client_id = ? ORDER BY date DESC LIMIT 1',
        [clientId],
        (err, latestMeasurement) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Get average workout rating
          db.get('SELECT AVG(rating) as avg_rating FROM workout_logs WHERE client_id = ? AND rating IS NOT NULL',
            [clientId],
            (err, ratingStats) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.json({
                total_workouts: workoutStats.total_workouts,
                average_rating: ratingStats.avg_rating,
                latest_measurement: latestMeasurement
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
