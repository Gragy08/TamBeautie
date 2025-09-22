const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: String,
    price: String,
    description: String,
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const Service = mongoose.model('Service', schema, "service");

module.exports = Service;
