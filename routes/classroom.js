const express = require("express");
const router = express.Router();
const {
  getClassByID,
  joinClass,
  addNewClass,
} = require("../controllers/classController");
const userMiddleware = require("../middleware/users");

router
  .route("/:id")
  .get(userMiddleware.isLoggedIn, getClassByID)
  .post(userMiddleware.isLoggedIn, joinClass);
router.route("/").post(userMiddleware.isLoggedIn, addNewClass);

module.exports = router;
