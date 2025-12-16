const connectDB = require('../_lib/db');
const Password = require('../_lib/models/Password');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { password } = req.body;

        if (!password || password.length !== 4) {
            return res.status(400).json({ success: false, message: 'Invalid password format' });
        }

        let storedPassword = await Password.findOne();

        // Initialize default password if not exists
        if (!storedPassword) {
            storedPassword = await Password.create({
                password: process.env.DEFAULT_PASSWORD || '1234'
            });
        }

        if (storedPassword.password === password) {
            return res.json({ success: true, message: 'Authentication successful' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
