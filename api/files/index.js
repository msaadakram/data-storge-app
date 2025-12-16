const connectDB = require('../_lib/db');
const File = require('../_lib/models/File');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        await connectDB();

        const files = await File.find().sort({ uploadedAt: -1 });

        return res.json({
            success: true,
            files: files.map(file => ({
                id: file._id,
                filename: file.filename,
                size: file.size,
                mimeType: file.mimeType,
                uploadedAt: file.uploadedAt
            }))
        });
    } catch (error) {
        console.error('List files error:', error);
        return res.status(500).json({ success: false, message: 'Failed to list files' });
    }
};
