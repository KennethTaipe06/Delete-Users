const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  role: String,
  password: String,
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
  semester: String,
  parallel: String,
  career: String,
  description: String
});

module.exports = mongoose.model('User', userSchema);
