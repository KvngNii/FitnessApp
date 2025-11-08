# FitWithNii

A comprehensive fitness application designed for personal trainers and fitness professionals to manage clients, create custom workouts, track progress, and manage payments.

## Features

### Client Management
- Add, view, edit, and delete clients
- Upload and manage client profile pictures
- Store client information including contact details, goals, and notes
- Track client progress and workout history
- Record body measurements over time

### Payment Tracking ⭐ NEW
- Record and track client payments
- Automatic countdown to next payment date
- Visual indicators for upcoming and overdue payments
- Payment frequency tracking (weekly, bi-weekly, monthly, quarterly, yearly)
- Payment history and statistics
- Multiple payment methods support

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

### Mobile App ⭐ NEW
- Android mobile app support via React Native
- Access all features on the go
- Profile picture uploads from camera or gallery
- Push notifications for payment reminders
- See MOBILE_APP_SETUP.md for setup instructions

## Technology Stack

### Backend
- Node.js with Express
- SQLite database
- RESTful API architecture
- Multer for file uploads
- Image storage for profile pictures

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- CSS3 for styling
- File upload support

### Mobile (Optional)
- React Native for Android
- Cross-platform components
- Native image picker integration
- See MOBILE_APP_SETUP.md for details

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KvngNii/FitnessApp.git
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
│   ├── middleware/
│   │   └── upload.js        # File upload configuration
│   ├── routes/
│   │   ├── clients.js       # Client management routes
│   │   ├── exercises.js     # Exercise library routes
│   │   ├── workouts.js      # Workout creation routes
│   │   ├── progress.js      # Progress tracking routes
│   │   └── payments.js      # Payment tracking routes
│   ├── uploads/             # Uploaded profile pictures
│   └── fitness.db           # SQLite database (auto-generated)
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/      # React components
│       │   ├── Dashboard.js
│       │   ├── ClientList.js
│       │   ├── ClientDetail.js
│       │   ├── WorkoutList.js
│       │   ├── WorkoutDetail.js
│       │   ├── ExerciseList.js
│       │   └── PaymentTracker.js
│       ├── services/        # API service layer
│       │   └── api.js
│       ├── App.js
│       ├── App.css
│       └── index.js
├── package.json
├── README.md
└── MOBILE_APP_SETUP.md      # Mobile app setup guide
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
- `POST /api/clients/:id/profile-picture` - Upload profile picture ⭐
- `DELETE /api/clients/:id/profile-picture` - Delete profile picture ⭐

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

### Payments ⭐ NEW
- `GET /api/payments/client/:clientId` - Get all payments for a client
- `GET /api/payments/upcoming` - Get upcoming payments (within specified days)
- `GET /api/payments/overdue` - Get overdue payments
- `POST /api/payments` - Create new payment record
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/stats/client/:clientId` - Get payment statistics for a client

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

### Managing Payments ⭐ NEW
1. Navigate to a client's detail page
2. Scroll to the "Payment Tracking" section
3. Click "Add Payment" to record a new payment
4. Set the amount, next payment date, and frequency
5. View countdown timers showing days until next payment
6. Monitor payment status (upcoming, due soon, overdue)

### Uploading Profile Pictures ⭐ NEW
1. Open a client's detail page
2. Click "Change Picture" below the profile photo
3. Select an image file (max 5MB)
4. Picture will be uploaded and displayed automatically

## Database Schema

The application uses SQLite with the following main tables:
- **clients** - Client information with profile pictures
- **exercises** - Exercise library
- **workouts** - Workout templates
- **workout_exercises** - Exercises within workouts
- **client_workouts** - Workouts assigned to clients
- **workout_logs** - Completed workout records
- **exercise_logs** - Detailed exercise performance
- **body_measurements** - Body measurement tracking
- **payments** - Payment records with next payment date tracking ⭐

## Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

```
PORT=5000
NODE_ENV=development
```

## Mobile App

FitWithNii includes support for an Android mobile app built with React Native. See [MOBILE_APP_SETUP.md](./MOBILE_APP_SETUP.md) for detailed setup instructions.

### Mobile App Features
- Full client management on mobile
- Profile picture uploads from camera or gallery
- Payment tracking with push notifications
- Workout logging and progress tracking
- Offline support with data sync

## Future Enhancements

Potential features for future development:
- User authentication and authorization
- Client portal for self-logging workouts
- Exercise video uploads and demonstrations
- Advanced progress charts and analytics
- Workout calendar and scheduling
- iOS mobile app version
- Export data to PDF reports
- Nutrition tracking integration
- Social features and community
- Integration with fitness wearables
- Automated payment processing
- Email/SMS reminders for payments and sessions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

---

**FitWithNii** - Empowering fitness professionals to manage their business efficiently 💪
