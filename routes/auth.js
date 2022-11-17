const express = require("express");
const router = express.Router();
const {
  getRegister,
  postRegister,
  postLogin,
  getLogin,
  getLogout,
} = require("../controllers/authController");
const userMiddleware = require("../middleware/users");

router
  .route("/register")
  .get(getRegister)
  .post(userMiddleware.validateRegister, postRegister);
router.route("/login").get(getLogin).post(postLogin);
router.route("/logout").get(getLogout);

module.exports = router;
