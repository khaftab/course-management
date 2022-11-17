const db = require(".././utils/db.js");
const asyncHandler = require("express-async-handler");

/**
 * @route   GET /materials
 * @desc    GET all materials
 * @access  Private
 */
const getMaterials = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT u.first_name, u.last_name, u.avatar, m.id, m.info, m.posted_on FROM users u JOIN materials m ON u.id = m.user_id and m.class_code= ? ORDER BY UNIX_TIMESTAMP(m.posted_on) DESC",
    [req.app.locals.class_code]
  );
  for (let i = 0; i < rows.length; i++) {
    let results = await db.execute(
      "SELECT `file_name` FROM `material_files` WHERE `material_id` = ?",
      [rows[i].id]
    );
    let filenames = results[0].map((r) => r.file_name);
    rows[i].files = filenames;
  }
  return res.json(rows);
});

module.exports = {
  getMaterials,
};
