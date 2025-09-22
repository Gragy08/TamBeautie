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

module.exports = router;