const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const decisionRoutes = require('./routes/decision');

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/decision', decisionRoutes);

app.get('/', (req,  res) => {
    res.json({ message: 'Server is running' });
});

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ db: 'connected', time: result.rows[0].now });
    } catch (err) {
        res.status(599).json({ db: 'failed', error: err.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});