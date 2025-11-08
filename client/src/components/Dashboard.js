import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientAPI, workoutAPI, exerciseAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalWorkouts: 0,
    totalExercises: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [clients, workouts, exercises] = await Promise.all([
        clientAPI.getAll(),
        workoutAPI.getAll(),
        exerciseAPI.getAll(),
      ]);

      setStats({
        totalClients: clients.data.length,
        totalWorkouts: workouts.data.length,
        totalExercises: exercises.data.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p>Welcome to your Fitness App</p>
      </div>

      <div className="stats-grid">
        <Link to="/clients" className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3 className="stat-value">{stats.totalClients}</h3>
            <p className="stat-label">Total Clients</p>
          </div>
        </Link>

        <Link to="/workouts" className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-info">
            <h3 className="stat-value">{stats.totalWorkouts}</h3>
            <p className="stat-label">Workouts Created</p>
          </div>
        </Link>

        <Link to="/exercises" className="stat-card">
          <div className="stat-icon">🏋️</div>
          <div className="stat-info">
            <h3 className="stat-value">{stats.totalExercises}</h3>
            <p className="stat-label">Exercise Library</p>
          </div>
        </Link>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/clients" className="btn btn-primary">Manage Clients</Link>
          <Link to="/workouts" className="btn btn-success">Create Workout</Link>
          <Link to="/exercises" className="btn btn-secondary">Add Exercise</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
