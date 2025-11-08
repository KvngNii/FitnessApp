import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import ExerciseList from './components/ExerciseList';
import WorkoutList from './components/WorkoutList';
import WorkoutDetail from './components/WorkoutDetail';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">Fitness App</Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/clients" className="nav-link">Clients</Link>
              </li>
              <li className="nav-item">
                <Link to="/workouts" className="nav-link">Workouts</Link>
              </li>
              <li className="nav-item">
                <Link to="/exercises" className="nav-link">Exercises</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/workouts" element={<WorkoutList />} />
            <Route path="/workouts/:id" element={<WorkoutDetail />} />
            <Route path="/exercises" element={<ExerciseList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
