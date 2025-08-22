const router = require('express').Router();
const blogRoutes = require('./blog.route');
const homeRoutes = require('./home.route');

router.use('/', homeRoutes);
router.use('/blogs', blogRoutes);

module.exports = router;