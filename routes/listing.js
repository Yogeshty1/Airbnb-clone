const express = require("express");
const router = express.Router();
const wrapAsync =require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {listingschema , reviewSchema} = require("../schema.js");
const ExpressError =require("../utils/ExpressError.js");

//validate listing
const validateListing =(req,res,next) =>{
  let {error} = listingschema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }else{
    next();
  }
};

//Index Route
router.get("/", wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync (async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/",validateListing, wrapAsync(async (req, res , next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "Listing created successfully");
  res.redirect("/listings");
} 
));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  
  if (!deletedListing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
}));

module.exports = router;