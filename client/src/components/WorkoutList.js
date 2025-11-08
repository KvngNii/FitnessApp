import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutAPI, exerciseAPI } from '../services/api';
import './WorkoutList.css';

function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'beginner',
    duration_minutes: '',
  });
  const [selectedExercises, setSelectedExercises] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsRes, exercisesRes] = await Promise.all([
        workoutAPI.getAll(),
        exerciseAPI.getAll(),
      ]);
      setWorkouts(workoutsRes.data);
      setExercises(exercisesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddExercise = () => {
    setSelectedExercises([
      ...selectedExercises,
      { exercise_id: '', sets: '', reps: '', rest_seconds: '', notes: '' },
    ]);
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...selectedExercises];
    updated[index][field] = value;
    setSelectedExercises(updated);
  };

  const handleRemoveExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await workoutAPI.create({
        ...formData,
        exercises: selectedExercises.filter((ex) => ex.exercise_id),
      });
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        difficulty: 'beginner',
        duration_minutes: '',
      });
      setSelectedExercises([]);
      loadData();
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading workouts...</div>;
  }

  return (
    <div className="workout-list">
      <div className="page-header">
        <h1 className="page-title">Workouts</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Create New Workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="card">
          <p>No workouts found. Create your first workout to get started!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {workouts.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-header">
                <h3>{workout.name}</h3>
                <div className="workout-actions">
                  <Link to={`/workouts/${workout.id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(workout.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {workout.description && <p className="workout-description">{workout.description}</p>}
              <div className="workout-meta">
                {workout.difficulty && (
                  <span className={`badge badge-${workout.difficulty}`}>
                    {workout.difficulty}
                  </span>
                )}
                {workout.duration_minutes && (
                  <span className="duration">{workout.duration_minutes} minutes</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2 className="modal-title">Create New Workout</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Workout Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    name="difficulty"
                    className="form-control"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    className="form-control"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="exercises-section">
                <div className="section-header">
                  <h3>Exercises</h3>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleAddExercise}
                  >
                    Add Exercise
                  </button>
                </div>

                {selectedExercises.map((exercise, index) => (
                  <div key={index} className="exercise-row">
                    <div className="form-group flex-1">
                      <select
                        className="form-control"
                        value={exercise.exercise_id}
                        onChange={(e) => handleExerciseChange(index, 'exercise_id', e.target.value)}
                      >
                        <option value="">Select exercise</option>
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Sets"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Reps"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Rest (sec)"
                        value={exercise.rest_seconds}
                        onChange={(e) => handleExerciseChange(index, 'rest_seconds', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Workout</button>
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

export default WorkoutList;
