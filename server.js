const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
// const testRoutes = require('./routes/testRoutes');
// const documentRoutes = require('./routes/documentRoutes');
// const submissionRoutes = require('./routes/submissionRoutes');
// const aiRoutes = require('./routes/aiRoutes');
// const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
// app.use('/api/tests', testRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/submissions', submissionRoutes);
// app.use('/api/ai', aiRoutes);
// app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'SportsGauge Backend Running! 🏅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});