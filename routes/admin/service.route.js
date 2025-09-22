const router = require('express').Router();
const multer = require('multer');
const upload = multer();

const serviceController = require("../../controller/admin/service.controller")

// const serviceValidate = require("../../validates/admin/service.validate")

router.get('/list', serviceController.service)

router.get('/list/trash', serviceController.trashService);

router.get('/create', serviceController.createService)

router.post(
    '/create',
    upload.none(),
    serviceController.createServicePost,
)

router.get('/edit/:id', serviceController.editService)

router.patch(
    '/edit/:id',
    upload.none(),
    serviceController.editServicePatch
)

router.patch('/delete/:id', serviceController.deleteServicePatch);

router.patch('/undo/:id', serviceController.undoServicePatch);

router.delete('/destroy/:id', serviceController.destroyServiceDelete);

module.exports = router;