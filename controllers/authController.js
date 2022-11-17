const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { faker } = require("@faker-js/faker");
const db = require(".././utils/db.js");
const maxAge = 3 * 24 * 60 * 60;
const asyncHandler = require("express-async-handler");

/**
 * @route   GET /register
 * @desc    Register page
 * @access  Public
 */
const getRegister = (req, res) => {
  res.render("register");
};

/**
 * @route   POST /register
 * @desc    Register user
 * @access  Public
 */
const postRegister = asyncHandler(async (req, res) => {
  const { email, password, first_name, last_name, is_teacher } = req.body;
  const [rows] = await db.execute("SELECT * FROM `users` WHERE `email` = ? ", [
    email,
  ]);
  if (rows.length) {
    res.status(409);
    return res.send(`<script>alert("This email is already in use!");  window.location.href = "/register"</script>`)
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db.execute(
    "INSERT INTO `users` (`first_name`, `last_name`, `email`, `password`, `is_teacher`, `avatar`) VALUES (?, ?, ?, ?, ?, ?)",
    [
      first_name,
      last_name,
      email,
      hashedPassword,
      is_teacher == "true" ? 1 : 0,
      faker.image.abstract(200, 200, true),
    ]
  );
  if (user.insertId) res.status(201).redirect("/login");
  else{
    res.status(500)
    throw new Error("server error")
  }
});

/**
 * @route   GET /login
 * @desc    Login page
 * @access  Public
 */
const getLogin = (req, res) => res.render("login");

/**
 * @route   POST /login
 * @desc    Login user
 * @access  Public
 */
const postLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [user] = await db.execute("SELECT * FROM `users` WHERE `email` = ?", [
    email,
  ]);
  let isSame = false;
  if(user.length)
    isSame = await bcrypt.compare(password, user[0].password);
  if (isSame) {
    const token = jwt.sign(
      {
        username: `${user[0].first_name} ${user[0].last_name}`,
        userId: user[0].id,
      },
      "fvbghvggtughrtgjvfbvhff",
      {
        expiresIn: maxAge,
      }
      );
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      return res.redirect("/dashboard");
    }
    if (!user.length || !isSame) {
      res.status(401)
      throw new Error("Email or password is incorrect!")
    }
});

/**
 * @route   GET /logout
 * @desc    Logout user
 * @access  Private
 */
const getLogout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  getLogout,
  postLogin,
};
