const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addToCartSchema = new Schema({
  username: {
    type:String,
    required: true,
    ref: 'users'
  },
  productName:{
    type: String,
    trim: true,
    required: true
  },
  productImg: {
    type: String,
    trim: true,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default:1
  }
}, { timestamps: true });

module.exports = mongoose.model('AddToCart', addToCartSchema);
