import app from '../backend/app.js';
import connectDB from '../backend/config/db.js';

// Initialize connection to database
connectDB();

export default app;
