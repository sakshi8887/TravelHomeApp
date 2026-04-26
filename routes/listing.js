const express=require("express");
const router=express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController=require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });
const Booking = require("../models/booking");

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.createListing));

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single('listing[image][url]'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


// Booking route
router.post("/:id/book", isLoggedIn, async (req, res) => {
    let { id } = req.params;

    const booking = new Booking({
        listing: id,
        user: req.user._id,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate
    });

    await booking.save();
    req.flash("success", "Booking confirmed!");
    res.redirect(`/listings/${id}`);
});
// edit route
router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(listingController.renderEditForm));


module.exports=router;