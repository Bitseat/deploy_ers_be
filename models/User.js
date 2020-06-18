const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let userSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  avatar: {
    type: Array
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  mobile_number: {
    type: String
  },
  skills: {
    type: Array
  },
  college_name: {
    type: String
  },
  degree: {
    type: Array
  },
  designation: {
    type: Array
  },
  experience: {
    type: Array
  },
  company_names: {
    type: Array
  },
  total_experience: {
    type: String
  },
}, {
  collection: 'users'
})

module.exports = mongoose.model('User', userSchema)
