const router = require('express').Router();
const multer = require('multer');
const upload = multer();

const bookingController = require("../../controller/admin/booking.controller")

// List all bookings
router.get('/list', bookingController.booking)

// Create booking (needs contactId)
router.get('/create/:id', bookingController.create)
router.post('/create/:id', upload.none(), bookingController.createPost)

// Edit booking (only bookingId needed)
router.get('/edit/:bookingId', bookingController.edit)
router.post('/edit/:bookingId', upload.none(), bookingController.editPatch)

// Trash list (all deleted bookings)
router.get('/list/trashList', bookingController.trashList)

// Trash list for a specific patient
router.get('/list/trash/:id', bookingController.trashCustomerBooking)

// Delete booking (soft delete)
router.patch('/delete/:bookingId', bookingController.deleteBookingPatch)

// Undo delete booking
router.patch('/undo/:bookingId', bookingController.undoBookingPatch)

// Destroy booking (permanent delete)
router.delete('/destroy/:bookingId', bookingController.destroyBookingDelete)

// Bulk status update
router.patch('/bulk-status', bookingController.bulkStatusPatch)

// View booking (needs contactId and bookingId)
router.get('/view/:id/:bookingId', bookingController.view)

module.exports = router;