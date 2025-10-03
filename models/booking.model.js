const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  idCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
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
    enum: ["transferred", "cash", "dept", "unsuccess", "guarantee", "cancel"],
    default: "unsuccess"
  },
  description: String,
  deleted: {
    type: Boolean,
    default: false
  },
  search: String,
  deletedAt: Date
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema, 'booking');

module.exports = Booking;
