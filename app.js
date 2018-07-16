var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport = require('passport')
var passportLocal = require('passport-local')
var passportLocalMongoose = require('passport-local-mongoose')
var expressSession = require('express-session')
var Camp = require('./models/campground')
var Comments = require('./models/comment')
var User = require('./models/user')
var seedDB = require('./seed')
var commentRoutes = require('./routes/comment')
var campgroundRoutes = require('./routes/campgrounds')
var authRoutes = require('./routes/auth')
var methodOverride=require('method-override')
var flash=require('connect-flash')
//seedDB()
app.use(flash())
app.set('view engine', 'ejs')
app.use(bodyParser.json(true))
app.use(bodyParser.urlencoded({
  extended: 'false'
}))


app.use(express.static(__dirname + '/public'))
mongoose.connect('mongodb://vikram:viki@ds049848.mlab.com:49848/training', function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('Connection Sucessful')
  }
})

app.locals.moment = require('moment')

app.use(expressSession(({
  secret: 'dof',
  resave: false,
  saveUninitialized: false
})))

app.use(methodOverride('_method'))
app.use(passport.initialize())
app.use(passport.session())
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error=req.flash('error')
  res.locals.success=req.flash('success')
  next();
});


passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use('/',authRoutes)
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/comments',commentRoutes)


app.listen(5005, function () {
  console.log('Server running at 3000')
})
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  else res.redirect('/login')
}