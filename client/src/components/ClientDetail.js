import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientAPI, progressAPI } from '../services/api';
import './ClientDetail.css';

function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementData, setMeasurementData] = useState({
    weight: '',
    height: '',
    body_fat_percentage: '',
    chest: '',
    waist: '',
    hips: '',
    notes: '',
  });

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      const [clientRes, workoutsRes, statsRes, measurementsRes] = await Promise.all([
        clientAPI.getById(id),
        clientAPI.getWorkouts(id),
        progressAPI.getStats(id),
        progressAPI.getMeasurements(id, 5),
      ]);

      setClient(clientRes.data);
      setWorkouts(workoutsRes.data);
      setStats(statsRes.data);
      setMeasurements(measurementsRes.data);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementSubmit = async (e) => {
    e.preventDefault();
    try {
      await progressAPI.addMeasurements({
        client_id: id,
        ...measurementData,
      });
      setShowMeasurementModal(false);
      setMeasurementData({
        weight: '',
        height: '',
        body_fat_percentage: '',
        chest: '',
        waist: '',
        hips: '',
        notes: '',
      });
      loadClientData();
    } catch (error) {
      console.error('Error adding measurements:', error);
      alert('Failed to add measurements');
    }
  };

  if (loading) {
    return <div className="loading">Loading client details...</div>;
  }

  if (!client) {
    return <div className="error">Client not found</div>;
  }

  return (
    <div className="client-detail">
      <div className="page-header">
        <div>
          <Link to="/clients" className="back-link">&larr; Back to Clients</Link>
          <h1 className="page-title">{client.name}</h1>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-section">
          <div className="card">
            <h2>Client Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Email:</strong> {client.email}
              </div>
              {client.phone && (
                <div className="info-item">
                  <strong>Phone:</strong> {client.phone}
                </div>
              )}
              {client.date_of_birth && (
                <div className="info-item">
                  <strong>Date of Birth:</strong> {new Date(client.date_of_birth).toLocaleDateString()}
                </div>
              )}
              {client.gender && (
                <div className="info-item">
                  <strong>Gender:</strong> {client.gender}
                </div>
              )}
              {client.goals && (
                <div className="info-item full-width">
                  <strong>Goals:</strong> {client.goals}
                </div>
              )}
              {client.notes && (
                <div className="info-item full-width">
                  <strong>Notes:</strong> {client.notes}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <h2>Progress Stats</h2>
            </div>
            {stats && (
              <div className="stats-grid-small">
                <div className="stat-item">
                  <div className="stat-value">{stats.total_workouts}</div>
                  <div className="stat-label">Total Workouts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="stat-label">Avg Rating</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <div className="card">
            <div className="section-header">
              <h2>Body Measurements</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowMeasurementModal(true)}
              >
                Add Measurement
              </button>
            </div>
            {measurements.length === 0 ? (
              <p>No measurements recorded yet.</p>
            ) : (
              <div className="measurements-list">
                {measurements.map((m) => (
                  <div key={m.id} className="measurement-item">
                    <div className="measurement-date">
                      {new Date(m.date).toLocaleDateString()}
                    </div>
                    <div className="measurement-details">
                      {m.weight && <span>Weight: {m.weight} kg</span>}
                      {m.body_fat_percentage && <span>BF: {m.body_fat_percentage}%</span>}
                      {m.waist && <span>Waist: {m.waist} cm</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2>Assigned Workouts</h2>
            {workouts.length === 0 ? (
              <p>No workouts assigned yet.</p>
            ) : (
              <div className="workouts-list">
                {workouts.map((workout) => (
                  <div key={workout.id} className="workout-item">
                    <h3>{workout.name}</h3>
                    <p>{workout.description}</p>
                    <div className="workout-meta">
                      <span className="badge">{workout.difficulty}</span>
                      <span>{workout.duration_minutes} min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showMeasurementModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Body Measurements</h2>
              <button className="close-btn" onClick={() => setShowMeasurementModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleMeasurementSubmit}>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={measurementData.weight}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, weight: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={measurementData.height}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, height: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Body Fat Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={measurementData.body_fat_percentage}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, body_fat_percentage: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Chest (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={measurementData.chest}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, chest: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Waist (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={measurementData.waist}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, waist: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Hips (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={measurementData.hips}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, hips: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  className="form-control"
                  value={measurementData.notes}
                  onChange={(e) =>
                    setMeasurementData({ ...measurementData, notes: e.target.value })
                  }
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Save Measurements</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMeasurementModal(false)}
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

export default ClientDetail;
