const router = require('express').Router();
const multer = require('multer');
const upload = multer();

const contactController = require("../../controller/admin/contact.controller")

const contactValidate = require("../../validates/admin/contact.validate")

router.get('/list', contactController.contact)

router.get('/create', contactController.createContact)

router.post(
    '/create',
    upload.none(),
    contactController.createContactPost,
    contactValidate.createContactPost
)

module.exports = router;