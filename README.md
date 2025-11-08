# Fitness App

A comprehensive fitness application designed for personal trainers and fitness professionals to manage clients, create custom workouts, and track progress over time.

## Features

### Client Management
- Add, view, edit, and delete clients
- Store client information including contact details, goals, and notes
- Track client progress and workout history
- Record body measurements over time

### Workout Creation
- Build custom workout templates
- Create an exercise library with detailed information
- Organize exercises by category, muscle group, and equipment
- Define sets, reps, rest periods, and notes for each exercise

### Progress Tracking
- Log completed workouts with ratings and notes
- Track body measurements (weight, body fat %, circumferences)
- View progress statistics and trends
- Monitor workout frequency and performance

## Technology Stack

### Backend
- Node.js with Express
- SQLite database
- RESTful API architecture

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FitnessApp
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

#### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev:all
```

Or run them separately:

Backend (runs on port 5000):
```bash
npm run dev
```

Frontend (runs on port 3000):
```bash
cd client
npm start
```

#### Production Mode

Build the frontend:
```bash
npm run build
```

Start the backend server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
FitnessApp/
├── backend/
│   ├── database.js          # Database initialization and schema
│   ├── server.js            # Express server setup
│   ├── routes/
│   │   ├── clients.js       # Client management routes
│   │   ├── exercises.js     # Exercise library routes
│   │   ├── workouts.js      # Workout creation routes
│   │   └── progress.js      # Progress tracking routes
│   └── fitness.db           # SQLite database (auto-generated)
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/      # React components
│       ├── services/        # API service layer
│       ├── App.js
│       ├── App.css
│       └── index.js
├── package.json
└── README.md
```

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/:id/workouts` - Get client's workouts
- `POST /api/clients/:id/workouts` - Assign workout to client

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/exercises` - Create new exercise
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get workout by ID with exercises
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `POST /api/workouts/:id/exercises` - Add exercise to workout
- `DELETE /api/workouts/:workoutId/exercises/:exerciseId` - Remove exercise from workout

### Progress
- `POST /api/progress/workout-logs` - Log completed workout
- `GET /api/progress/workout-logs/client/:clientId` - Get client's workout logs
- `GET /api/progress/workout-logs/:id` - Get specific workout log
- `POST /api/progress/measurements` - Add body measurements
- `GET /api/progress/measurements/client/:clientId` - Get client's measurements
- `GET /api/progress/stats/client/:clientId` - Get client progress statistics

## Usage Guide

### Adding a New Client
1. Navigate to the Clients page
2. Click "Add New Client"
3. Fill in the client information
4. Click "Create Client"

### Creating a Workout
1. Navigate to the Exercises page and add exercises to your library
2. Go to the Workouts page
3. Click "Create New Workout"
4. Enter workout details (name, description, difficulty, duration)
5. Click "Add Exercise" to add exercises from your library
6. Specify sets, reps, and rest periods for each exercise
7. Click "Create Workout"

### Tracking Progress
1. Open a client's detail page
2. Click "Add Measurement" to record body measurements
3. Assign workouts to the client from the workout library
4. Log completed workouts with performance details

## Database Schema

The application uses SQLite with the following main tables:
- **clients** - Client information
- **exercises** - Exercise library
- **workouts** - Workout templates
- **workout_exercises** - Exercises within workouts
- **client_workouts** - Workouts assigned to clients
- **workout_logs** - Completed workout records
- **exercise_logs** - Detailed exercise performance
- **body_measurements** - Body measurement tracking

## Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```
PORT=5000
NODE_ENV=development
```

## Future Enhancements

Potential features for future development:
- User authentication and authorization
- Client portal for self-logging workouts
- Exercise video uploads
- Progress charts and analytics
- Workout calendar and scheduling
- Mobile app version
- Export data to PDF reports
- Social features and community

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
