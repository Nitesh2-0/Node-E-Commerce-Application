const mongoose = require('mongoose')
async function databaseConnection() {
  try {
    await mongoose.connect(process.env.url)
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
}
module.exports = databaseConnection;