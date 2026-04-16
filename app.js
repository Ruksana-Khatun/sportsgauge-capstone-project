const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const testRoutes = require('./routes/testRoutes');
const documentRoutes = require('./routes/documentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'SportsGauge Backend Running! 🏅' });
});

module.exports = app;