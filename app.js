var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser')
var cors = require('cors')

var indexRouter = require('./routes/index');
const { isLoggedIn } = require('./middleware/users.js');

var app = express();

app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(cors())

app.use(express.json({limit: '50mb'}));
app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({ extended: false,limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/public')));


app.get('*', isLoggedIn);
app.use('/', indexRouter);


const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
