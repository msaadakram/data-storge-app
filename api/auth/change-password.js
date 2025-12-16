const connectDB = require('../_lib/db');
const Password = require('../_lib/models/Password');

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

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both passwords required' });
        }

        if (newPassword.length !== 4 || !/^\d{4}$/.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'New password must be 4 digits' });
        }

        const storedPassword = await Password.findOne();
        if (!storedPassword || storedPassword.password !== currentPassword) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        storedPassword.password = newPassword;
        await storedPassword.save();

        return res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
