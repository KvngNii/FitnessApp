import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client API
export const clientAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  getWorkouts: (id) => api.get(`/clients/${id}/workouts`),
  assignWorkout: (id, workoutId) => api.post(`/clients/${id}/workouts`, { workout_id: workoutId }),
  uploadProfilePicture: (id, file) => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return axios.post(`${API_BASE_URL}/clients/${id}/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteProfilePicture: (id) => api.delete(`/clients/${id}/profile-picture`),
};

// Exercise API
export const exerciseAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
};

// Workout API
export const workoutAPI = {
  getAll: () => api.get('/workouts'),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  addExercise: (id, data) => api.post(`/workouts/${id}/exercises`, data),
  removeExercise: (workoutId, exerciseId) => api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`),
};

// Progress API
export const progressAPI = {
  logWorkout: (data) => api.post('/progress/workout-logs', data),
  getWorkoutLogs: (clientId, limit) => api.get(`/progress/workout-logs/client/${clientId}`, { params: { limit } }),
  getWorkoutLog: (id) => api.get(`/progress/workout-logs/${id}`),
  addMeasurements: (data) => api.post('/progress/measurements', data),
  getMeasurements: (clientId, limit) => api.get(`/progress/measurements/client/${clientId}`, { params: { limit } }),
  getStats: (clientId) => api.get(`/progress/stats/client/${clientId}`),
};

// Payment API
export const paymentAPI = {
  getAll: (clientId) => api.get(`/payments/client/${clientId}`),
  getUpcoming: (days) => api.get('/payments/upcoming', { params: { days } }),
  getOverdue: () => api.get('/payments/overdue'),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getStats: (clientId) => api.get(`/payments/stats/client/${clientId}`),
};

export default api;
