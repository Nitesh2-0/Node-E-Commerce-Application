const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const plm = require('passport-local-mongoose');

const userSchema = new Schema({
  password: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  Locality: {
    type: String,
    required: true
  },
  Country: {
    type: String,
    required: true
  },
  CountryCode: {
    type: String,
    required: true
  },
  State: {
    type: String,
    required: true
  },
  Zip: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    required: true
  },
  profileImg: {
    type: String,
    default: 'https://static.vecteezy.com/system/resources/thumbnails/020/765/399/small/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg'
  }  
});

userSchema.plugin(plm);
const User = mongoose.model('User', userSchema);
module.exports = User;
