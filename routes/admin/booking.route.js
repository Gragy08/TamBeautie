const router = require('express').Router();
const multer = require('multer');
const upload = multer();

const bookingController = require("../../controller/admin/booking.controller")

router.get('/list', bookingController.booking)

router.get('/create/:id', bookingController.create)
router.post(
    '/create/:id',
    upload.none(),
    bookingController.createPost,
)

router.get('/edit/:id/:bookingId', bookingController.edit)
router.post(
    '/edit/:id/:bookingId',
    upload.none(),
    bookingController.editPatch,
)

router.get('/list/trash/:id', bookingController.trashCustomerBooking)

router.get('/list/trashList', bookingController.trashList)

router.patch('/delete/:id/:bookingId', bookingController.deleteBookingPatch);

router.patch('/undo/:id/:bookingId', bookingController.undoBookingPatch);

router.delete('/destroy/:id/:bookingId', bookingController.destroyBookingDelete);

router.patch('/bulk-status', bookingController.bulkStatusPatch);

module.exports = router;