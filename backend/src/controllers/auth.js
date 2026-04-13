const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const register = async (req, res) => {
    const { email, password } = req.body;
    
    if(!email || !password){
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const existing = await pool.query(
            `SELECT user_id FROM auth.users WHERE email = $1`, [email]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered. '});
        } 

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO auth.users (email, password_hash) VALUES ($1, $2) RETURNING user_id, email, created_at`, [email, password_hash]
        );
    } catch(err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

const login = async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM auth.users WHERE email = $1`, [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' })
        };

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match){
            return res.status(401).json({ error: 'Invalid credentials.' })
        };

        res.json({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                created_at: user.created_at
            }
        });
    } catch(err){
        console.error('Login error: ', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { register, login };