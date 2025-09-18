const router = require('express').Router();

const AboutController = require('../../controller/client/about.controller');

router.get('/', AboutController.about);

module.exports = router;