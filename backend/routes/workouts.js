const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all workouts
router.get('/', (req, res) => {
  db.all('SELECT * FROM workouts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single workout with exercises
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // Get workout details
  db.get('SELECT * FROM workouts WHERE id = ?', [id], (err, workout) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Get exercises for this workout
    const sql = `SELECT we.*, e.name, e.description, e.category, e.muscle_group, e.equipment
                 FROM workout_exercises we
                 JOIN exercises e ON we.exercise_id = e.id
                 WHERE we.workout_id = ?
                 ORDER BY we.order_index`;

    db.all(sql, [id], (err, exercises) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      workout.exercises = exercises;
      res.json(workout);
    });
  });
});

// Create a new workout
router.post('/', (req, res) => {
  const { name, description, difficulty, duration_minutes, exercises } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Workout name is required' });
  }

  const sql = `INSERT INTO workouts (name, description, difficulty, duration_minutes)
               VALUES (?, ?, ?, ?)`;

  db.run(sql, [name, description, difficulty, duration_minutes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const workoutId = this.lastID;

    // Add exercises if provided
    if (exercises && exercises.length > 0) {
      const stmt = db.prepare(`INSERT INTO workout_exercises
                               (workout_id, exercise_id, sets, reps, duration_seconds, rest_seconds, order_index, notes)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

      exercises.forEach((exercise, index) => {
        stmt.run([
          workoutId,
          exercise.exercise_id,
          exercise.sets,
          exercise.reps,
          exercise.duration_seconds,
          exercise.rest_seconds,
          index,
          exercise.notes
        ]);
      });

      stmt.finalize();
    }

    res.status(201).json({ id: workoutId, message: 'Workout created successfully' });
  });
});

// Update a workout
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, difficulty, duration_minutes } = req.body;

  const sql = `UPDATE workouts
               SET name = ?, description = ?, difficulty = ?, duration_minutes = ?,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [name, description, difficulty, duration_minutes, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout updated successfully' });
  });
});

// Delete a workout
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM workouts WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted successfully' });
  });
});

// Add exercise to workout
router.post('/:id/exercises', (req, res) => {
  const { id } = req.params;
  const { exercise_id, sets, reps, duration_seconds, rest_seconds, notes } = req.body;

  if (!exercise_id) {
    return res.status(400).json({ error: 'exercise_id is required' });
  }

  // Get the current max order_index
  db.get('SELECT MAX(order_index) as max_index FROM workout_exercises WHERE workout_id = ?',
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const orderIndex = (row.max_index || -1) + 1;

      const sql = `INSERT INTO workout_exercises
                   (workout_id, exercise_id, sets, reps, duration_seconds, rest_seconds, order_index, notes)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(sql, [id, exercise_id, sets, reps, duration_seconds, rest_seconds, orderIndex, notes], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Exercise added to workout successfully' });
      });
    }
  );
});

// Remove exercise from workout
router.delete('/:workoutId/exercises/:exerciseId', (req, res) => {
  const { workoutId, exerciseId } = req.params;

  db.run('DELETE FROM workout_exercises WHERE workout_id = ? AND id = ?',
    [workoutId, exerciseId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Exercise not found in workout' });
      }
      res.json({ message: 'Exercise removed from workout successfully' });
    }
  );
});

module.exports = router;
