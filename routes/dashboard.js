const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");
const userMiddleware = require("../middleware/users");

router.route("/").get(userMiddleware.isLoggedIn, getDashboard);

module.exports = router;
