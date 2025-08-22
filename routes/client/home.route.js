const router = require('express').Router();

const HomeController = require('../../controller/client/home.controller');

router.get('/', HomeController.home);

module.exports = router;