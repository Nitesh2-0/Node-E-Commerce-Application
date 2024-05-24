require('dotenv').config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./models/users');
const databaseConnection = require('./db');
const passport = require('passport');
const expressSession = require('express-session');
const { addAbortListener } = require('events');

var app = express();

/** Database Connected */
databaseConnection()

/** view engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** passport-js */
app.use(expressSession({
  resave:false, 
  saveUninitialized:false,
  secret:process.env.SECRET
}));

app.use(passport.initialize()); 
app.use(passport.session()); 
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

/**Basic Requirement */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/** Roote */
app.use('/', indexRouter);
app.use('/users', usersRouter);


/** Page Not Found Error */
app.use('*', (req,res,next)=>{
  res.render('NotFound')
})

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


app.listen(process.env.PORT, ()=> console.log(`Server is listing on Port : ${process.env.PORT}`));

module.exports = app;
