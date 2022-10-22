const jwt = require("jsonwebtoken");
const db = require(".././utils/db.js");

module.exports = {
  validateRegister: (req, res, next) => {
    // username min length 3
    if (!req.body.first_name || req.body.first_name.length < 3) {
      return res.status(400).send({
        msg: "Please enter a username with min. 3 chars",
      });
    }

    if (!req.body.email || req.body.email.length < 10) {
      return res.status(400).send({
        msg: "Please enter a valid email",
      });
    }

    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).send({
        msg: "Please enter a password with min. 6 chars",
      });
    }
    next();
  },
  isLoggedIn: (req, res, next) => {
    // try {
      // const token = req.headers.authorization.split(" ")[1];
      // const token = req.cookies.jwt;
      // const decoded = jwt.verify(token, "SECRETKEY");
      // req.userData = decoded;
      // next();
    // } catch (err) {
      // return res.status(401).send({
      //   msg: "Your session is not valid!",
      // });
    // }


    const token = req.cookies.jwt;
    if (token) {
      jwt.verify(token, "SECRETKEY", async (err, decoded) => {
        if (err) {
          res.locals.user = null;
          return res.status(401).send({
            msg: "Your session is not valid!",
          });
        } else {
          req.userData = decoded;
          db.query(
            `SELECT * FROM users WHERE id = ${db.escape(req.userData.userId)}`,
            (err, result) => {
              if (result) {
                res.locals.user = result[0];
              }
            }
          );

          next();
        }
      });
    } else {
      res.locals.user = null;
      next();
    }
  }
};
