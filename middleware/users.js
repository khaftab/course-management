const jwt = require("jsonwebtoken");
const db = require(".././utils/db.js");

module.exports = {
  validateRegister: (req, res, next) => {
    // username min length 3
    if (!req.body.first_name || req.body.first_name.length < 3) {
      res.status(400);
      return res.send(`<script>alert("Please enter a username with min. 3 chars");  history.back()</script>`)
    }

    if (!req.body.email || req.body.email.length < 5) {
      res.status(400);
      return res.send(`<script>alert("Please enter a valid email");  history.back()</script>`)
    }

    // password min 6 chars
    if (!req.body.password || req.body.password.length < 6) {
      res.status(400);
      return res.send(`<script>alert("Please enter a password with min. 6 chars");  history.back()</script>`)
    }
    next();
  },
  isLoggedIn : async (req, res, next) => {
    const token = req.cookies.jwt;
    if(token){
      try {
        const decoded = await jwt.verify(token, "fvbghvggtughrtgjvfbvhff")
        req.userData = decoded;
        const[user] = await db.execute('SELECT * FROM `users` WHERE `id` = ?',[req.userData.userId]);
        const {first_name, last_name, id, email, avatar} = user[0]
        if(user) res.locals.user = {first_name, last_name, id, email, avatar};
        next()
      } catch (error) {
        res.status(400);
        res.redirect("/login");
      }
    }else if(token == undefined){
      return res.redirect("/login");
    }else{
      res.locals.user = null;
      next();
    }
  }
};
