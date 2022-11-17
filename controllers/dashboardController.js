const db = require(".././utils/db.js");
const asyncHandler = require("express-async-handler");

/**
 * @route   GET /dashboard
 * @desc    Users dashboard
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res) => {
  let [user] = await db.execute(
    "SELECT `first_name`, `avatar` FROM `users` WHERE `id` = ?",
    [req.userData.userId]
  );
  let [rows] = await db.execute(
    "SELECT `user_id`, `class_name`, `class_code` FROM `enrollment` JOIN `classes` ON enrollment.class_id = classes.id WHERE user_id = ?",
    [req.userData.userId]
  );
  const { first_name, avatar } = user[0];
  res.render("dashboard", {
    first_name,
    avatar,
    classes: rows,
  });
});

module.exports = {
  getDashboard,
};
