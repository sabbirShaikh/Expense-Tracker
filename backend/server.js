import 'dotenv/config';
import connectDB from './config/db.js';
import app from './app.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
