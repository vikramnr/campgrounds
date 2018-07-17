var express = require('express')
var router = express.Router()
var Camp = require('../models/campground')
var middleWare = require('../middleware/index')
var multer = require('multer')
var storge = multer.diskStorage({
    filename: function(req,file,callback){
        callback(null,Date.now()+file.originalname)
    }
})
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
}

var upload = multer({storge:storge,fileFilter:imageFilter})

var cloudinary = require('cloudinary')
cloudinary.config({
    cloud_name:'dg6pzjhcw',
    api_key:'616768382369741',
    api_secret:'GFscWk-G63Xx2BbGBRAAubGP12k'
})

router.get('/', function (req, res) {
    if (req.query.search) {
        const Regex = new RegExp(escapeRegex(req.query.search), 'gi')
        Camp.find({name: Regex}, function (err, result) {
            if (err || !result) {
                req.flash('error', 'An error might have occured')
                res.redirect('/')
                console.log(err)
            } else {
                if(result.length<1){
                    req.flash('error','No campgrounds found with your query. Add a new one')
                    res.redirect('/home')
                }else{
                    res.render('campgrounds/index', {camps: result,page: 'campgrounds'})
                }
                
            }
        })
    } else {
        Camp.find({}, function (err, result) {
            if (err || !result) {
                req.flash('error', 'An error might have occured')
                res.redirect('/')
                console.log(err)
            } else {
                res.render('campgrounds/index', {
                    camps: result,
                    page: 'campgrounds'
                })
            }
        })
    }
})

router.post('/', middleWare.isLoggedIn,upload.single('campimage'), function (req, res) {
    var name = req.body.campname
    var image = req.body.campimage
    console.log(req.body.cost + 'Cost submitted')
    var price = req.body.cost
    var description = req.body.campdesc
    var campObj = {
        name: name,
        image: image,
        cost: price,
        description: description,
        author: {
            id: req.user._id,
            username: req.user.username
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

router.get('/new', middleWare.isLoggedIn, function (req, res) {
    res.render('campgrounds/new')
})

router.get('/:id', function (req, res) {
    Camp.findById(req.params.id).populate('comments').exec(function (err, result) {
        if (err || !result) {
            req.flash('error', 'Campground not found')
            res.redirect('/')
            console.log(err)
        } else {

            res.render('campgrounds/show', {
                camp: result
            })
        }
    })
})
router.get('/:id/edit', middleWare.checkOwnerCamp, function (req, res) {
    Camp.findById(req.params.id, function (err, foundCamp) {
        if (err || !foundCamp) {
            req.flash('sucess', 'An error might have happened')
            res.redirect('/')
        }
    })
})
router.put('/:id', middleWare.checkOwnerCamp, function (req, res) {
    var name = req.body.campname
    var image = req.body.campimage
    console.log(req.body.cost + 'Cost submitted')
    var cost = req.body.cost
    var description = req.body.campdesc
    var campObj = {
        name: name,
        image: image,
        cost: cost,
        description: description,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    }
    Camp.findByIdAndUpdate(req.params.id, campObj, function (err, foundCamp) {
        if (err || !foundCamp) {
            req.flash('error', 'An error might have happened')
            res.redirect('/')
            console.log(err)
        } else {
            res.redirect('/')
        }
    })
})

router.delete('/:id', middleWare.checkOwnerCamp, function (req, res) {
    Camp.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/')
        }
    })
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router