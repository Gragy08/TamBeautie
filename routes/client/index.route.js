const router = require('express').Router();
const blogRoutes = require('./blog.route');
const homeRoutes = require('./home.route');
const aboutRoutes = require('./about.route');

router.use('/', homeRoutes);
router.use('/blogs', blogRoutes);
router.use('/about', aboutRoutes);

module.exports = router;