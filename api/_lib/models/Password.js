const mongoose = require('mongoose');

const PasswordSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 4
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Password || mongoose.model('Password', PasswordSchema);
