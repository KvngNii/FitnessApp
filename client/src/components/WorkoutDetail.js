import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import './WorkoutDetail.css';

function WorkoutDetail() {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, [id]);

  const loadWorkout = async () => {
    try {
      const response = await workoutAPI.getById(id);
      setWorkout(response.data);
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading workout...</div>;
  }

  if (!workout) {
    return <div className="error">Workout not found</div>;
  }

  return (
    <div className="workout-detail">
      <div className="page-header">
        <div>
          <Link to="/workouts" className="back-link">&larr; Back to Workouts</Link>
          <h1 className="page-title">{workout.name}</h1>
        </div>
      </div>

      <div className="card">
        <div className="workout-info">
          {workout.description && (
            <p className="description">{workout.description}</p>
          )}
          <div className="workout-stats">
            {workout.difficulty && (
              <div className="stat">
                <strong>Difficulty:</strong>
                <span className={`badge badge-${workout.difficulty}`}>
                  {workout.difficulty}
                </span>
              </div>
            )}
            {workout.duration_minutes && (
              <div className="stat">
                <strong>Duration:</strong>
                <span>{workout.duration_minutes} minutes</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Exercises</h2>
        {!workout.exercises || workout.exercises.length === 0 ? (
          <p>No exercises added to this workout yet.</p>
        ) : (
          <div className="exercises-table">
            <table>
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Rest</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {workout.exercises.map((exercise, index) => (
                  <tr key={index}>
                    <td>
                      <div className="exercise-name">{exercise.name}</div>
                      {exercise.description && (
                        <div className="exercise-desc">{exercise.description}</div>
                      )}
                    </td>
                    <td>{exercise.sets || '-'}</td>
                    <td>{exercise.reps || '-'}</td>
                    <td>{exercise.rest_seconds ? `${exercise.rest_seconds}s` : '-'}</td>
                    <td>{exercise.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutDetail;
