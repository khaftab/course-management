var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { faker } = require('@faker-js/faker');


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
 router.get("/register", (req, res)=>{
  res.render("register")
})

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
               VALUES (${db.escape(req.body.first_name.toLowerCase())},${db.escape(
                req.body.last_name.toLowerCase()
              )},${db.escape(req.body.email)}, ${db.escape(hash)}, ${db.escape(req.body.is_teacher == 'true' ? 1 : 0)},"${faker.image.abstract(200, 200, true)}")`,
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
router.get("/login", (req, res)=>{
  res.render("login")
})

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
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000  });
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
    `SELECT * FROM users WHERE id = ${db.escape(req.userData.userId)};SELECT user_id, class_name, class_code FROM enrollment JOIN classes ON enrollment.class_id = classes.id WHERE user_id=${req.userData.userId}`,
    (err, result) => {
      if (result) {
        const {first_name, avatar} = result[0][0];
        res.render("dashboard",{
          first_name,
          avatar,
          classes: result[1]
        })
      }
    }
  );
});

/**
 * @route   GET /logout
 * @desc    Logout user
 * @access  Private
 */

router.get("/logout",userMiddleware.isLoggedIn, (req, res)=>{
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/login');
})

/**
 * @route   POST /courses
 * @desc    Add course
 * @access  Private
 */

 router.post("/classes",userMiddleware.isLoggedIn, (req, res)=>{
  let sql = `INSERT INTO classes(class_code, class_name) VALUES("${req.body.class_code}", "${req.body.class_name.toLowerCase()}");`
  let class_id;
  db.query(sql, (err, result) => {
      if (err) return res.json({
        code: err.code
      });
      class_id = result.insertId;
      sql = `INSERT INTO enrollment(user_id, class_id) VALUES(${req.userData.userId},${class_id});`
      db.query(sql, (err, result) => {
        if (err) throw err;
        return res.json({ 
          class_code: req.body.class_code
        })
      })
  })
})

/**
 * @route   POST /courses/:id
 * @desc    Add course
 * @access  Private
 */

//change it to put
 router.post("/classes/:id",userMiddleware.isLoggedIn, (req, res)=>{
  
  let sql = `SELECT * FROM classes WHERE class_code = ${db.escape(req.body.class_code)};`

  db.query(sql, (err, result) => {
    console.log(result.length)
    if (err) return res.json({code: err.code});
    if(result.length){
    const {class_code, class_name, id} = result[0];
    sql = `INSERT INTO enrollment (user_id, class_id) VALUES (${db.escape(req.userData.userId)},${db.escape(id)})`
    db.query(sql, (err, result) =>{
        if(err) return res.json({
          code: err.code
        })
        return res.json({
              class_name,
              class_code
        })
    })
  }else{
    return res.json({
      err: "Invalid code"
    })
  }
  })
})

/**
 * @route   GET /courses/:id
 * @desc    Get a class
 * @access  Private
 */

 router.get("/classes/:id",userMiddleware.isLoggedIn, (req, res)=>{
  
  let sql = `SELECT * FROM classes WHERE class_code = ${db.escape(req.params.id)};`
  db.query(sql, (err, result) => {
      if (err) throw err;
      if (result.length) {
        sql = `SELECT users.id, first_name, last_name, avatar, is_teacher   
        FROM  users   
        JOIN enrollment   
        ON users.id = enrollment.user_id   
        JOIN classes   
        ON classes.id = enrollment.class_id AND classes.id = ${result[0].id};
      `
        db.query(sql, (err, members)=>{
          if (err) throw err;
          const is_teacher = members.some(e => {
            return e.id == req.userData.userId ? e.is_teacher : null
          })
          if (members.length) {
            return res.render("class",{
              class_name: result[0].class_name.toUpperCase(),
              class_code: result[0].class_code,
              members,
              is_teacher
            })
          }
        })
      }
  })
})


/**
 * @route   POST /assignment
 * @desc    Add assignment
 * @access  Private
 */

//change it to put
router.post("/assignments",userMiddleware.isLoggedIn, (req, res)=>{
  // const {text, files, choice, full_marks, date} = req.body;
  // let ids = []
  // if(Array.isArray(req.body.files)){
  // req.body.files.forEach(async file => {
  //   const{id, name, type, data} = await JSON.parse(file);
  //   ids.push(data)
  //   let sql = `INSERT INTO files(id, file_name, file_type, file_data) VALUES(${id},${name},${type},${data});`
  //     await db.query(sql, (err, result) => {
  //       if (err) throw err;
  //       return res.json({ 
  //         msg: "Error Occured"
  //       })
  //     })
  // });
  // }
  // let imgs = ""
  // ids.forEach(id => {
  //   imgs += `<image src="data:image/jpeg;base64,${id}">`
  // });
  // res.send(imgs)
})


module.exports = router;
