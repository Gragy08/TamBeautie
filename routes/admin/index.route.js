const router = require('express').Router();

const dashboardRoute = require("./dashboard.route");
const accountRouters = require("./account.route");
const authMiddleware = require("../../middlewares/admin/auth.middleware");
const contactRoute = require("./contact.route")
const serviceRoute = require("./service.route")

router.use('/account', accountRouters)
router.use('/dashboard', authMiddleware.verifyToken, dashboardRoute)
router.use('/contact', authMiddleware.verifyToken, contactRoute)
router.use('/service', authMiddleware.verifyToken, serviceRoute)

module.exports = router;