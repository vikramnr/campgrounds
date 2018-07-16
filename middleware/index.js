var middlewareObj={}
var Camp = require("../models/campground");
var Comment = require("../models/comment");

middlewareObj.isLoggedIn=function (req, res, next) {
    if (req.isAuthenticated()) return next()
    else {
        req.flash('error','You need to logged into to do that')
        res.redirect('/login')
    }
}

middlewareObj.checkOwnerCamp=function (req,res,next){
    if(req.isAuthenticated()){
        Camp.findById(req.params.id,function(err,foundCamp){
            if(err || !foundCamp) {
                req.flash('error',"Something went wrong. Please try again after sometime")
                res.redirect('back')
                console.log(err)
            }else{
                if(foundCamp.author.id.equals(req.user._id) || req.user.isAdmin){
                    next()    
                } else{
                    req.flash('error',"You don't have permission to do that")
                    res.redirect('back')
                }
            }
            
        })
    }else{
        
        req.flash('error','You need to logged into to do that')
        res.redirect('back')
    }
}

middlewareObj.checkOwnerComment=function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err) {
                req.flash('error',"Something went wrong. Please try again after sometime")
                res.redirect('back')
                console.log(err)
            }else{
                if(foundComment.author.id.equals(req.user._id)|| req.user.isAdmin){
                    next()    
                } else{
                    req.flash('error',"You don't have permission to do that")
                    res.redirect('back')
                }
            }
            
        })
    }else{
        req.flash('error','You need to logged into to do that')
        res.redirect('back')
    }
}

module.exports=middlewareObj