
var express = require('express')
var router = express.Router()
var passport = require('passport')
var Camp = require('../models/campground')
var Comment = require('../models/comment')
var User = require('../models/user')
//-----------------------------------------//
//Auth Routes
//-----------------------------------------//
router.get('/',function(req,res){
    res.redirect('/campgrounds')
})
router.get('/home',function(req,res){
    res.render('campgrounds/landing')
})
router.get('/register', function (req, res) {
    res.render('auth/register')
})
router.post('/register', function (req, res) {
    var newUser=new User({username: req.body.username })
    if(req.body.admincode==='secretcode'){
        newUser.isAdmin=true
    }
    User.register(newUser, req.body.password, function (err, newUser) {
        if (err) {
            req.flash('error',err.message)
            res.redirect('/register')
        }
        else {
            passport.authenticate('local')(req, res, function () {
                req.flash('success','Welcome to YelpCamp')
                res.redirect('/campgrounds')
            })
        }
    })
})
router.get('/login', function (req, res) {
    res.render('auth/login')
})
router.post('/login', passport.authenticate("local", {
    successRedirect: '/campgrounds',
    failureRedirect: '/register'
}), function (req, res) {

})

router.get('/logout', function (req, res) {
    req.flash('success','Logged out of yelpcamp')
    req.logout();
    res.redirect('/login')
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next()
    else res.redirect('/login')
}
module.exports = router