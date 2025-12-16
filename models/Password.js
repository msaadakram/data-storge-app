const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 4
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

passwordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Password', passwordSchema);
