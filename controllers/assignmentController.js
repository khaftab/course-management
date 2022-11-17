const db = require(".././utils/db.js");
const { uploadFiles, base64toFile } = require("../utils/utils");
const { marked } = require("marked");
const dayjs = require("dayjs");
const asyncHandler = require("express-async-handler");

/**
 * @route   GET /assignments
 * @desc    GET all assignments
 * @access  Private
 */
const getAssignments = asyncHandler(async (req, res) => {
  console.log({ass: req.app.locals.class_code})
  const [rows] = await db.execute(
    "SELECT u.first_name, u.last_name, u.avatar, a.info, a.id as assignment_id, UNIX_TIMESTAMP(a.posted_on) as DATE, a.full_marks FROM users u JOIN assignments a ON u.id = a.user_id and a.class_code = ? ORDER BY DATE DESC",
    [req.app.locals.class_code]
  );
  for (let i = 0; i < rows.length; i++) {
    let sql = `SELECT file_name FROM assignment_files WHERE assignment_id = ?`;
    let results = await db.execute(sql, [rows[i].assignment_id]);
    let filenames = results[0].map((r) => r.file_name);
    rows[i].files = filenames;
  }
  return res.json(rows);
});

/**
 * @route   POST /assignment
 * @desc    Add assignment
 * @access  Private
 */
const postAssignments = asyncHandler(async (req, res) => {
  const { text, files, choice, full_marks, date, class_code } = req.body;
  const html = marked.parse(text);
  console.log({class_code})
  if (choice == "assignment") {
    const [result] = await db.execute(
      "INSERT INTO `assignments`(`info`, `class_code`, `due_date`, `user_id`, `full_marks`) VALUES( ?, ?, ?, ?, ?)",
      [html, class_code, date, req.userData.userId, full_marks]
    );
    let assignment_id = result.insertId;
    uploadFiles(files, assignment_id);
  } else {
    const [result] = await db.execute(
      "INSERT INTO `materials`(`info`, `class_code`, `user_id`) VALUES( ?, ?, ?)",
      [html, class_code, req.userData.userId]
    );
    let material_id = result.insertId;
    uploadFiles(files, null, material_id);
  }
  res.redirect("back");
});

const updateMarks = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "UPDATE `submissions` SET `obtained_marks` = ? WHERE `user_id` = ? AND assignment_id= ?",
    [req.body.grade, req.body.userId, req.app.locals.assignment_id]
  );
  if (rows)
    res.json({
      msg: "success",
    });
});

/**
 * @route   GET /assignments/:id
 * @desc    GET  assignment by ID
 * @access  Private
 */

const getAssignmentbyId = asyncHandler(async (req, res) => {
  const [assignment] = await db.execute(
    "SELECT * FROM `assignments` WHERE `id` = ?",
    [req.params.id]
  );
  const { id, info, due_date, full_marks } = assignment[0];
  const [rows] = await db.execute(
    "SELECT `obtained_marks`, `file_name` FROM `submissions` WHERE `user_id` = ? and assignment_id = ?",
    [req.userData.userId, req.params.id]
  );
  res.render("assignment", {
    id,
    info,
    due_date: dayjs(due_date),
    full_marks,
    obtained_marks: rows.length ? rows[0].obtained_marks : 0,
    file_name: rows.length ? rows[0].file_name.substring(9) : "",
  });
});

/**
 * @route   POST /assignments/:id/submissions
 * @desc    POST  a file to an assignment
 * @access  Private
 */
const postSubmission = asyncHandler(async (req, res) => {
  const { id, name, data } = JSON.parse(req.body.files);
  let filename = `${id}${name}`;

  const [rows] = await db.execute(
    "INSERT INTO submissions(assignment_id, user_id, file_name) VALUES( ?, ?, ?)",
    [req.params.id, req.userData.userId, filename]
  );
  base64toFile(`${data}`, `${filename}`);
  res.redirect("back");
});

/**
 * @route   GET /assignments/:id/submissions
 * @desc    GET  all submissions with id
 * @access  Private
 */
const getSubmissions = asyncHandler(async (req, res) => {
  req.app.locals.assignment_id = req.params.id;
  let sql = `SELECT u.id, u.first_name, u.last_name, u.avatar, s.file_name, a.full_marks, s.obtained_marks, a.due_date
    FROM users u 
    JOIN submissions s
    ON u.id = s.user_id 
    JOIN assignments a
    ON a.id = s.assignment_id
    and s.assignment_id = ?`;
  const [rows] = await db.execute(sql, [req.params.id]);

  const [data] = await db.execute(
    "SELECT full_marks, due_date FROM assignments WHERE id = ?",
    [req.params.id]
  );
  res.render("submissions", {
    rows,
    due_date: dayjs(data[0].due_date),
    full_marks: data[0].full_marks,
  });
});

module.exports = {
  getAssignments,
  postAssignments,
  updateMarks,
  getAssignmentbyId,
  postSubmission,
  getSubmissions,
};
