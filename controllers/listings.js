const Listing=require("../models/listing");
const mongoose = require('mongoose');
module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs", { allListings});
    
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
    
};


module.exports.showListing=async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({"path": "reviews", populate: { path: "author" }}).populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};


module.exports.createListing=async (req,res,next)=>{
   let url= req.file.path;
   let filename=req.file.filename;
    let { listing } = req.body;

    const newListing = new Listing({
    ...listing,
    image: {
      url: listing.image?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",   
      filename: "listingimage"
    },

    owner: new mongoose.Types.ObjectId(req.user._id)
});
    newListing.owner=req.user._id;
    newListing.image={url, filename};
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
    
};

module.exports.renderEditForm=async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload", "/upload/w_250"); // Example transformation to get a smaller version of the image
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing=async (req, res) => {
    console.log(req.body);
    let { id } = req.params;
    let updateData = req.body.listing || {};

    let listing=await Listing.findByIdAndUpdate(id, {
     ...updateData,
      image: {
      url: updateData.image?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",   // ✅ correct
      filename: "listingimage"
       },
        
    });
   
  if(typeof req.file !== "undefined"){
   let url= req.file.path;
   let filename=req.file.filename;
   listing.image={url, filename};
   await listing.save();
   }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
};

module.exports.index = async (req, res) => {
    let { category, search } = req.query;
    let allListings;

    if (category) {
        // category filter
        allListings = await Listing.find({ category });
    } 
    else if (search) {
        // search filter
        let regex = new RegExp(search, "i");

        allListings = await Listing.find({
            $or: [
                { title: regex },
                { location: regex },
                { country: regex }
            ]
        });
    } 
    else {
        
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};