const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('User', userSchema);
