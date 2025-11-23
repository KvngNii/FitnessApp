const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'fitness.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Clients table
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      goals TEXT,
      notes TEXT,
      profile_picture TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Exercises table (library of available exercises)
  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      muscle_group TEXT,
      equipment TEXT,
      video_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Workouts table (workout templates)
  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      difficulty TEXT,
      duration_minutes INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Workout exercises (exercises within a workout)
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets INTEGER,
      reps INTEGER,
      duration_seconds INTEGER,
      rest_seconds INTEGER,
      order_index INTEGER,
      notes TEXT,
      FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    )
  `);

  // Client workouts (assign workouts to clients)
  db.run(`
    CREATE TABLE IF NOT EXISTS client_workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      workout_id INTEGER NOT NULL,
      assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
      FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
    )
  `);

  // Workout logs (track completed workouts)
  db.run(`
    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      workout_id INTEGER NOT NULL,
      completed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      duration_minutes INTEGER,
      notes TEXT,
      rating INTEGER,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
      FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
    )
  `);

  // Exercise logs (detailed tracking of each exercise in a workout)
  db.run(`
    CREATE TABLE IF NOT EXISTS exercise_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_log_id INTEGER NOT NULL,
      exercise_id INTEGER NOT NULL,
      sets_completed INTEGER,
      reps_completed INTEGER,
      weight_used REAL,
      duration_seconds INTEGER,
      notes TEXT,
      FOREIGN KEY (workout_log_id) REFERENCES workout_logs (id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    )
  `);

  // Body measurements (track client progress)
  db.run(`
    CREATE TABLE IF NOT EXISTS body_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      weight REAL,
      height REAL,
      body_fat_percentage REAL,
      chest REAL,
      waist REAL,
      hips REAL,
      bicep_left REAL,
      bicep_right REAL,
      thigh_left REAL,
      thigh_right REAL,
      notes TEXT,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    )
  `);

  // Payments table (track client payments)
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      next_payment_date DATETIME NOT NULL,
      payment_frequency TEXT DEFAULT 'monthly',
      payment_method TEXT,
      notes TEXT,
      status TEXT DEFAULT 'paid',
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    )
  `);

  // MoMo transactions table (track mobile money transactions)
  db.run(`
    CREATE TABLE IF NOT EXISTS momo_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER,
      client_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'GHS',
      phone_number TEXT NOT NULL,
      reference_id TEXT UNIQUE NOT NULL,
      external_id TEXT,
      status TEXT DEFAULT 'pending',
      payer_message TEXT,
      payee_note TEXT,
      financial_transaction_id TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE SET NULL,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized successfully');
});

module.exports = db;
