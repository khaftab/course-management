const express = require("express");
const router = express.Router();
const { getMaterials } = require("../controllers/materialController");
const userMiddleware = require("../middleware/users");

router.route("/").get(userMiddleware.isLoggedIn, getMaterials);

module.exports = router;
