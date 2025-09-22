const router = require('express').Router();
const multer = require('multer');
const upload = multer();

const contactController = require("../../controller/admin/contact.controller")

const contactValidate = require("../../validates/admin/contact.validate")

router.get('/list', contactController.contact)

router.get('/list/trash', contactController.trashContact);

router.get('/create', contactController.createContact)

router.post(
    '/create',
    upload.none(),
    contactController.createContactPost,
)

router.get('/edit/:id', contactController.editContact)

router.patch(
    '/edit/:id',
    upload.none(),
    contactController.editContactPatch
)

router.patch('/delete/:id', contactController.deleteContactPatch);

router.patch('/undo/:id', contactController.undoContactPatch);

router.delete('/destroy/:id', contactController.destroyContactDelete);

router.get('/view/:id', contactController.view)

module.exports = router;