import React, { useState, useEffect } from 'react';
import { exerciseAPI } from '../services/api';
import './ExerciseList.css';

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    muscle_group: '',
    equipment: '',
    video_url: '',
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const response = await exerciseAPI.getAll();
      setExercises(response.data);
    } catch (error) {
      console.error('Error loading exercises:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await exerciseAPI.create(formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        muscle_group: '',
        equipment: '',
        video_url: '',
      });
      loadExercises();
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Failed to create exercise');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await exerciseAPI.delete(id);
        loadExercises();
      } catch (error) {
        console.error('Error deleting exercise:', error);
        alert('Failed to delete exercise');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading exercises...</div>;
  }

  return (
    <div className="exercise-list">
      <div className="page-header">
        <h1 className="page-title">Exercise Library</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add New Exercise
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="card">
          <p>No exercises found. Add your first exercise to build your library!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-header">
                <h3>{exercise.name}</h3>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(exercise.id)}
                >
                  Delete
                </button>
              </div>
              {exercise.description && (
                <p className="exercise-description">{exercise.description}</p>
              )}
              <div className="exercise-meta">
                {exercise.category && (
                  <span className="badge badge-category">{exercise.category}</span>
                )}
                {exercise.muscle_group && (
                  <span className="badge badge-muscle">{exercise.muscle_group}</span>
                )}
                {exercise.equipment && (
                  <span className="badge badge-equipment">{exercise.equipment}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Exercise</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Exercise Name *</label>
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
                  placeholder="How to perform this exercise..."
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="balance">Balance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Muscle Group</label>
                <select
                  name="muscle_group"
                  className="form-control"
                  value={formData.muscle_group}
                  onChange={handleInputChange}
                >
                  <option value="">Select muscle group</option>
                  <option value="chest">Chest</option>
                  <option value="back">Back</option>
                  <option value="shoulders">Shoulders</option>
                  <option value="arms">Arms</option>
                  <option value="legs">Legs</option>
                  <option value="core">Core</option>
                  <option value="full body">Full Body</option>
                </select>
              </div>
              <div className="form-group">
                <label>Equipment</label>
                <input
                  type="text"
                  name="equipment"
                  className="form-control"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  placeholder="e.g., Dumbbells, Barbell, Bodyweight..."
                />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="url"
                  name="video_url"
                  className="form-control"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Exercise</button>
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

export default ExerciseList;
