var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleWare = require('../middleware/index')
//Comments New
router.get("/new", middleWare.isLoggedIn, function (req, res) {
    // find campground by id
    console.log(req.params.id);
    Campground.findById(req.params.id, function (err, campground) {
        if (err || !campground) {
            req.flash('error','An error might have occured')
            res.redirect('/')
            console.log(err)
        } else {
            res.render("comments/new", {
                campground: campground
            });
        }
    })
});

//Comments Create
router.post("/", middleWare.isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, campground) {
        if (err || !campground) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    res.redirect('/')
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    console.log(comment);
                    req.flash('success', 'Comment added sucessfully')
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleWare.checkOwnerComment, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err || !foundComment) {
            req.flash('error','An error might have occured')
            res.redirect('/')
            console.log(err)
        } else {
            res.render("comments/edit", {
                campground_id: req.params.id,
                comment: foundComment
            });
        }
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleWare.checkOwnerComment, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err || !updatedComment) {
            req.flash('error', "Something went wrong. Please try again after sometime")
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleWare.checkOwnerComment, function (req, res) {
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            req.flash('error', "Something went wrong. Please try again after sometime")
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;