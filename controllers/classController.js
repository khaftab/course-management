const db = require(".././utils/db.js");
const asyncHandler = require("express-async-handler");

/**
 * @route   GET /classes/:id
 * @desc    Get a class
 * @access  Private
 */
const getClassByID = asyncHandler(async (req, res) => {
  req.app.locals.class_code = req.params.id;
  console.log({class:req.app.locals.class_code})
  const [rows] = await db.execute(
    "SELECT * FROM `classes` WHERE `class_code` = ?",
    [req.params.id]
  );
  if (rows.length) {
    const [members] = await db.execute(
      "SELECT `users`.`id`, `first_name`, `last_name`, `avatar`, `is_teacher` FROM  `users` JOIN `enrollment` ON `users`.`id` = `enrollment`.`user_id`  JOIN `classes` ON `classes`.`id` = `enrollment`.`class_id` AND `classes`.`id` = ?",
      [rows[0].id]
    );
    const is_teacher = members.some((member) => {
      return member.id == req.userData.userId ? member.is_teacher : null;
    });
    if (members.length) {
      res.render("class", {
        class_name: rows[0].class_name.toUpperCase(),
        class_code: rows[0].class_code,
        members,
        is_teacher,
      });
    }
  } else {
    res.redirect("/dashboard");
  }
});

/**
 * @route   POST /courses/:id
 * @desc    Join a course
 * @access  Private
 */
const joinClass = asyncHandler(async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM `classes` WHERE `class_code` = ?",
      [req.body.class_code]
    );
    if (result.length) {
      const { class_code, class_name, id } = result[0];
      const [rows] = await db.execute(
        "INSERT INTO `enrollment` (`user_id`, `class_id`) VALUES ( ?, ?)",
        [req.userData.userId, id]
      );
      return res.json({
        class_name,
        class_code,
      });
    } else {
      return res.json({
        err: "Invalid code",
      });
    }
  } catch (err) {
    return res.json({ code: err.code });
  }
});

/**
 * @route   POST /courses
 * @desc    Add course
 * @access  Private
 */
const addNewClass = asyncHandler(async (req, res) => {
  let { class_code, class_name } = req.body;
  const [result] = await db.execute(
    "INSERT INTO `classes`(`class_code`, `class_name`) VALUES( ?, ?)",
    [class_code, class_name.toLowerCase()]
  );
  const [rows] = await db.execute(
    "INSERT INTO `enrollment`(`user_id`, `class_id`) VALUES( ?, ?)",
    [req.userData.userId, result.insertId]
  );
  return res.json({ class_code });
});

module.exports = {
  getClassByID,
  joinClass,
  addNewClass,
};
