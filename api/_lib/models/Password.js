const mongoose = require('mongoose');

// Store password as a string that can be either:
// - a 4-digit plain PIN (legacy)
// - a bcrypt hash (current)
const PasswordSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Password || mongoose.model('Password', PasswordSchema);
