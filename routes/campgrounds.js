var express = require('express')
var router = express.Router()
var Camp = require('../models/campground')
var middleWare= require('../middleware/index')

router.get('/', function (req, res) {
    console.log(req.currentUser)
    Camp.find({}, function (err, result) {
        if (err || !result) {
            req.flash('error','An error might have occured')
            res.redirect('/')
            console.log(err)
        } else {
            res.render('campgrounds/index', {
                camps: result
            })
        }
    })
})

router.post('/',middleWare.isLoggedIn,function (req, res) {
    var name = req.body.campname
    var image = req.body.campimage
    var price=req.body.price
    var description = req.body.campdesc
    var campObj = {
        name: name,
        image: image,
        price:price,
        description: description,
        author:{
            id:req.user._id,
            username:req.user.username
    }
}
    Camp.create(campObj, function (err, result) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/campgrounds')
        }
    })
})

router.get('/new',middleWare.isLoggedIn,function (req, res) {
    res.render('campgrounds/new')
})

router.get('/:id', function (req, res) {
    Camp.findById(req.params.id).populate('comments').exec(function (err, result) {
        if (err || !result) {
            req.flash('error','Campground not found')
            res.redirect('/')
            console.log(err)
        } else {
            
            res.render('campgrounds/show', {
                camp: result
            })
        }
    })
})
router.get('/:id/edit',middleWare.checkOwnerCamp,function(req,res){
    Camp.findById(req.params.id,function(err,foundCamp){
        if(err || !foundCamp){
            req.flash('sucess','An error might have happened')
            res.redirect('/')
        }
        res.render('campgrounds/edit',{foundCamp:foundCamp})
    })
})
router.put('/:id',middleWare.checkOwnerCamp,function(req,res){
    var name = req.body.campname
    var image = req.body.campimage
    var description = req.body.campdesc
    var campObj = {
        name: name,
        image: image,
        description: description,
        author:{
            id:req.user._id,
            username:req.user.username
    }
}
    Camp.findByIdAndUpdate(req.params.id,campObj,function(err,foundCamp){
        if(err|| !foundCamp){
            req.flash('error','An error might have happened')
            res.redirect('/')
            console.log(err)
        }
        else{
            res.redirect('/')
        }
    })  
})

router.delete('/:id',middleWare.checkOwnerCamp,function(req,res){
    Camp.findByIdAndRemove(req.params.id,function(err){
        if(err) {console.log(err)}
        else{
            res.redirect('/')
        }
    })
})
module.exports = router  