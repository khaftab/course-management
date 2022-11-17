const express = require("express");
const router = express.Router();
const {
  getAssignments,
  postAssignments,
  updateMarks,
  getAssignmentbyId,
  postSubmission,
  getSubmissions,
} = require("../controllers/assignmentController");
const userMiddleware = require("../middleware/users");

router
  .route("/")
  .get(userMiddleware.isLoggedIn, getAssignments)
  .post(userMiddleware.isLoggedIn, postAssignments);

router.route("/update").put(userMiddleware.isLoggedIn, updateMarks);
router.route("/:id").get(userMiddleware.isLoggedIn, getAssignmentbyId);
router
  .route("/:id/submissions")
  .get(userMiddleware.isLoggedIn, getSubmissions)
  .post(userMiddleware.isLoggedIn, postSubmission);
module.exports = router;
