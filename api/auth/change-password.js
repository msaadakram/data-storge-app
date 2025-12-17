const connectDB = require('../_lib/db');
const Password = require('../_lib/models/Password');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
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

        // Handle string body if needed
        const body = typeof req.body === 'string'
            ? JSON.parse(req.body)
            : req.body || {};

        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords required' });
        }

        if (!/^\d{4}$/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'New password must be 4 digits' });
        }

        const storedPassword = await Password.findOne();
        if (!storedPassword) {
            return res.status(500).json({ success: false, message: 'Password not configured' });
        }

        const isMatch = await bcrypt.compare(currentPassword, storedPassword.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        storedPassword.password = await bcrypt.hash(newPassword, 10);
        await storedPassword.save();

        return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
