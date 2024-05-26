const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  productName: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  offer: {
    type: Number, 
    default: 0
  },
  stock: {
    type: Number,
    required: true
  },
  images: {
    type: [String], 
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
