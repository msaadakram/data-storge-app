const connectDB = require('../_lib/db');
const Password = require('../_lib/models/Password');

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

        // ⚠️ Ensure body exists (important for deployment)
        const body = typeof req.body === 'string'
            ? JSON.parse(req.body)
            : req.body;

        const { password } = body;

        // Validate password
        if (!password || !/^\d{4}$/.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be exactly 4 digits'
            });
        }

        // Get stored password
        let storedPassword = await Password.findOne();

        // First-time setup
        if (!storedPassword) {
            const defaultPassword = process.env.DEFAULT_PASSWORD || '1234';

            storedPassword = await Password.create({
                password: defaultPassword
            });

            // If user is logging in with default password
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

        // Compare password
        if (storedPassword.password !== password) {
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
