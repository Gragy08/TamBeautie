const router = require('express').Router();

const BlogController = require('../../controller/client/blog.controller');

router.get('/', BlogController.list);

module.exports = router;