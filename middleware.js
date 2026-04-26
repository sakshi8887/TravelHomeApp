const  Listing  = require("./models/listing");
const  Review  = require("./models/review");
const { listingSchema,reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');
module.exports.isLoggedIn=(req,res,next)=>{

    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");
    } 
   next();

};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;

    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    
    let existingListing= await Listing.findById(id);
    if(!existingListing.owner.equals(res.locals.currUser._id)){
        req.flash("error" , "you are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    if(!req.body || !req.body.listing){
        return next(); 
    }
    let {error} = listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map(el=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map(el=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;

    let existingReview = await Review.findById(reviewId);

    if (!existingReview) {
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    
    if (existingReview.author.toString() !== req.user._id.toString()) {
        req.flash("error", "You are not author of this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
};