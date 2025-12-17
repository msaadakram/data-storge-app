const connectDB = require('../_lib/db');
const Password = require('../_lib/models/Password');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Only POST method is allowed'
        });
    }

    try {
        await connectDB();

        // Ensure body exists (handle string body on some deployments)
        const body = typeof req.body === 'string'
            ? JSON.parse(req.body)
            : req.body || {};

        const { password } = body;

        // Validate password
        if (!password || !/^\d{4}$/.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be exactly 4 digits'
            });
        }

        // Get stored password (single document)
        let storedPassword = await Password.findOne();

        // First-time setup (no password document yet)
        if (!storedPassword) {
            const defaultPassword = process.env.DEFAULT_PASSWORD || '1234';
            const hashed = await bcrypt.hash(defaultPassword, 10);

            storedPassword = await Password.create({
                password: hashed
            });

            // Allow login if user enters the default password
            if (password === defaultPassword) {
                return res.status(200).json({
                    success: true,
                    message: 'Authenticated with default password'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // If the stored password looks like a legacy plain 4-digit PIN, support it
        if (/^\d{4}$/.test(storedPassword.password)) {
            if (storedPassword.password === password) {
                return res.status(200).json({
                    success: true,
                    message: 'Authentication successful'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Otherwise expect bcrypt hash (current behavior)
        const isMatch = await bcrypt.compare(password, storedPassword.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Authentication successful'
        });

    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
