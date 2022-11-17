let express = require("express");
let path = require("path");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let cors = require("cors");

let authRouter = require("./routes/auth.js");
let classroomRouter = require("./routes/classroom.js");
let materialsRouter = require("./routes/material");
let assignmentsRouter = require("./routes/assignment");
let dashboardRouter = require("./routes/dashboard");
const { errorHandler } = require('./middleware/errorMiddleware');

require("dotenv").config();

let app = express();

app.set("view engine", "ejs");

//Middlewares
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.render("login")
});
app.use(authRouter);
app.use("/classes", classroomRouter);
app.use("/materials", materialsRouter);
app.use("/assignments", assignmentsRouter);
app.use("/dashboard", dashboardRouter);
app.get("*", (req, res)=> res.render("error/404"));

app.use(errorHandler);
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`App listening at port ${port}`));
