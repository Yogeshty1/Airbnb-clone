const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");

router.get("/signup", (req, res) => {
    res.send("signup");
 //   res.render("register");
});

router.post("/register", wrapAsync(async (req, res) => {
    let { email, username, password } = req.body;
    let user = await User.register(new User({ email, username }), password);
    req.login(user, err => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    });
}));

module.exports = router;
