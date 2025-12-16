const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const connectDB = require('../_lib/db');
const File = require('../_lib/models/File');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectDB();

        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: 'File ID required' });
        }

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        if (req.method === 'DELETE') {
            // Delete from S3
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: file.s3Key
            }));

            // Delete from MongoDB
            await File.findByIdAndDelete(id);

            return res.json({ success: true, message: 'File deleted successfully' });
        }

        if (req.method === 'PUT') {
            // Rename file
            const { newName } = req.body;
            if (!newName || !newName.trim()) {
                return res.status(400).json({ success: false, message: 'New name is required' });
            }

            file.filename = newName.trim();
            file.originalName = newName.trim();
            await file.save();

            return res.json({ success: true, message: 'File renamed successfully' });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('File operation error:', error);
        return res.status(500).json({ success: false, message: 'Operation failed' });
    }
};
