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
        name: String,
        price: String,
        pay: String,
        date: Date,
        status: {
          type: String,
          enum: ["success", "unsuccess", "guarantee", "cancel"],
          default: "unsuccess"
        },
        description: String
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