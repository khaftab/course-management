const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { faker } = require("@faker-js/faker");
const fs = require("fs");
const { marked } = require("marked");
const db = require(".././utils/db.js");
const userMiddleware = require("../middleware/users.js");
const maxAge = 3 * 24 * 60 * 60;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("register");
});

/**
 * @route   GET /register
 * @desc    Register page
 * @access  Public
 */
router.get("/register", (req, res) => {
  res.render("register");
});

/**
 * @route   POST /register
 * @desc    Register user
 * @access  Public
 */

router.post("/register", userMiddleware.validateRegister, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: "This email is already in use!",
        });
      } else {
        // email is available
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            db.query(
              `INSERT INTO users (first_name, last_name, email, password, is_teacher, avatar)
               VALUES (${db.escape(
                 req.body.first_name.toLowerCase()
               )},${db.escape(req.body.last_name.toLowerCase())},${db.escape(
                req.body.email
              )}, ${db.escape(hash)}, ${db.escape(
                req.body.is_teacher == "true" ? 1 : 0
              )},"${faker.image.abstract(200, 200, true)}")`,
              (err, result) => {
                if (err) {
                  return res.status(400).send({
                    msg: err,
                  });
                }
                return res.status(201).redirect("/login");
              }
            );
          }
        });
      }
    }
  );
});

/**
 * @route   GET /login
 * @desc    Login page
 * @access  Public
 */
router.get("/login", (req, res) => {
  res.render("login");
});

/**
 * @route   POST /login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        return res.status(400).send({
          msg: err,
        });
      }

      if (!result.length) {
        return res.status(401).send({
          msg: "Username or password is incorrect!",
        });
      }

      // check password
      bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            return res.status(401).send({
              msg: "Username or password is incorrect!",
            });
          }

          if (bResult) {
            const token = jwt.sign(
              {
                username: `${result[0].first_name} ${result[0].last_name}`,
                userId: result[0].id,
              },
              "SECRETKEY",
              {
                expiresIn: maxAge,
              }
            );
            res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
            return res.redirect("/dashboard");
          }
          return res.status(401).send({
            msg: "Username or password is incorrect!",
          });
        }
      );
    }
  );
});

/**
 * @route   POST /dashboard
 * @desc    Users dashboard
 * @access  Private
 */
router.get("/dashboard", userMiddleware.isLoggedIn, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE id = ${db.escape(
      req.userData.userId
    )};SELECT user_id, class_name, class_code FROM enrollment JOIN classes ON enrollment.class_id = classes.id WHERE user_id=${
      req.userData.userId
    }`,
    (err, result) => {
      if (result) {
        const { first_name, avatar } = result[0][0];
        res.render("dashboard", {
          first_name,
          avatar,
          classes: result[1],
        });
      }
    }
  );
});

/**
 * @route   GET /logout
 * @desc    Logout user
 * @access  Private
 */

router.get("/logout", userMiddleware.isLoggedIn, (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
});

/**
 * @route   POST /courses
 * @desc    Add course
 * @access  Private
 */

router.post("/classes", userMiddleware.isLoggedIn, (req, res) => {
  let sql = `INSERT INTO classes(class_code, class_name) VALUES("${
    req.body.class_code
  }", "${req.body.class_name.toLowerCase()}");`;
  let class_id;
  db.query(sql, (err, result) => {
    if (err)
      return res.json({
        code: err.code,
      });
    class_id = result.insertId;
    sql = `INSERT INTO enrollment(user_id, class_id) VALUES(${req.userData.userId},${class_id});`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.json({
        class_code: req.body.class_code,
      });
    });
  });
});

/**
 * @route   POST /courses/:id
 * @desc    Add course
 * @access  Private
 */

//change it to put
router.post("/classes/:id", userMiddleware.isLoggedIn, (req, res) => {
  let sql = `SELECT * FROM classes WHERE class_code = ${db.escape(
    req.body.class_code
  )};`;

  db.query(sql, (err, result) => {
    if (err) return res.json({ code: err.code });
    if (result.length) {
      const { class_code, class_name, id } = result[0];
      sql = `INSERT INTO enrollment (user_id, class_id) VALUES (${db.escape(
        req.userData.userId
      )},${db.escape(id)})`;
      db.query(sql, (err, result) => {
        if (err)
          return res.json({
            code: err.code,
          });
        return res.json({
          class_name,
          class_code,
        });
      });
    } else {
      return res.json({
        err: "Invalid code",
      });
    }
  });
});

/**
 * @route   GET /courses/:id
 * @desc    Get a class
 * @access  Private
 */

router.get("/classes/:id", userMiddleware.isLoggedIn, (req, res) => {
  app.locals.class_code = req.params.id;
  let sql = `SELECT * FROM classes WHERE class_code = ${db.escape(
    req.params.id
  )};`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length) {
      sql = `SELECT users.id, first_name, last_name, avatar, is_teacher   
        FROM  users   
        JOIN enrollment   
        ON users.id = enrollment.user_id   
        JOIN classes   
        ON classes.id = enrollment.class_id AND classes.id = ${result[0].id};
      `;
      db.query(sql, (err, members) => {
        if (err) throw err;
        const is_teacher = members.some((e) => {
          return e.id == req.userData.userId ? e.is_teacher : null;
        });
        if (members.length) {
          return res.render("class", {
            class_name: result[0].class_name.toUpperCase(),
            class_code: result[0].class_code,
            members,
            is_teacher,
            file_paths: app.locals.file_paths,
          });
        }
      });
    }
  });
});

/**
 * @route   POST /assignment
 * @desc    Add assignment
 * @access  Private
 */

router.post("/assignments", userMiddleware.isLoggedIn, (req, res) => {
  const { text, files, choice, full_marks, date } = req.body;
  // const html = marked.parse(text);
  let html = text;
  if (choice == "assignment") {
    let sql = `INSERT INTO assignments(info, class_code, due_date, posted_on, user_id, full_marks, obtained_marks) VALUES(${db.escape(
      html
    )},"${app.locals.class_code}","${date}","${new Date()
      .toISOString()
      .slice(0, 10)}",${req.userData.userId},${full_marks},${0});`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      let assignment_id = result.insertId;
      uploadFiles(files, assignment_id);
    });
  } else {
    let sql = `INSERT INTO materials(info, class_code, user_id, posted_on) VALUES(${db.escape(
      html
    )},"${app.locals.class_code}",${req.userData.userId},"${new Date()
      .toISOString()
      .slice(0, 10)}");`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      let material_id = result.insertId;
      uploadFiles(files, null, material_id);
    });
  }
});

/**
 * @route   GET /assignments
 * @desc    GET all assignments
 * @access  Private
 */
router.get("/assignments", userMiddleware.isLoggedIn, async (req, res) => {
  let sql = `select u.first_name, u.last_name, u.avatar,a.id as assignment_id, a.posted_on, a.full_marks, a.obtained_marks FROM users u JOIN assignments a ON u.id = a.user_id;`;
  // db.query(sql, (err, results) => {
  //   if (err) throw err;
  // results = Object.values(JSON.parse(JSON.stringify(results)));
  // });
  db.promise()
    .query(sql)
    .then(([rows, fields]) => {
      console.log(rows)
      return Object.values(JSON.parse(JSON.stringify(rows)));
    })
    .then((rows) => {
      let test = []
      for (let i = 0; i < rows.length; i++) {
        let sql = `SELECT file_name FROM assignment_files WHERE assignment_id = ${rows[i].assignment_id}`;
        let results = await db.promise().query(sql)
        let filenames = results[0].map(r => r.file_name)
        rows[i].files = filenames
        test.push(rows[i])
      }
      return res.json(test)
      // console.log(rows)
      // return rows;
    })
    .then((rows) => {
      // console.log(rows);
    })
    .catch(console.log("Err occured"))
});

function uploadFiles(files, assignment_id = null, material_id = null) {
  if (Array.isArray(files)) {
    files.forEach((file) => {
      const { id, name, data } = JSON.parse(file);
      let filename = `${id}${name}`;
      base64toFile(`${data}`, `${filename}`);
      insertIntoFileDB(filename, assignment_id, material_id);
    });
  } else {
    const { id, name, data } = JSON.parse(files);
    let filename = `${id}${name}`;
    base64toFile(`${data}`, `${filename}`);
    insertIntoFileDB(filename, assignment_id, material_id);
  }
}

function insertIntoFileDB(filename, assignment_id, material_id) {
  if (assignment_id) {
    let sql = `INSERT INTO assignment_files(file_name, assignment_id) VALUES("${filename}",${assignment_id});`;
    db.query(sql, (err, result) => {
      if (err) throw err;
    });
  } else {
    let sql = `INSERT INTO material_files(file_name, material_id) VALUES("${filename}",${material_id});`;
    db.query(sql, (err, result) => {
      if (err) throw err;
    });
  }
}

function base64toFile(data, filename) {
  let buff = Buffer.from(data, "base64");
  let dir = "./public/uploads";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(`./public/uploads/${filename}`, buff);
}
module.exports = router;
