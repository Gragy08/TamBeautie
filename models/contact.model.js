const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    dob: Date,
    sex: String,
    description: String,
    bookings: [
      {
        services: [
          {
            name: String,
            price: Number,
            unit: Number
          }
        ],
        promotion: Number,
        total: Number,
        deposit: Number,
        pay: Number,
        date: Date,
        status: {
          type: String,
          enum: ["success", "unsuccess", "guarantee", "cancel"],
          default: "unsuccess"
        },
        description: String,
        deleted: {
          type: Boolean,
          default: false
        },
        search: String,
        deletedAt: Date
      }
    ],
    deleted: {
      type: Boolean,
      default: false
    },
    search: String,
    deletedAt: Date
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const Contact = mongoose.model('Contact', schema, "contact");

module.exports = Contact;