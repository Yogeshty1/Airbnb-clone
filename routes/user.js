const express = require("express");
const router = express.Router({mergeParams: true});
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveReturnTo } = require("../middleware");
// const { isLoggedIn } = require("../middleware");

router.get("/signup", (req, res) => {
    res.render("users/signup");
 //   res.render("register");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await
        User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}));


// Login Routes
router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login", saveReturnTo, 
    passport.authenticate("local", { 
        failureFlash: true, 
        failureRedirect: "/login" 
    }), 
    async(req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect(res.locals.returnTo || "/listings");
    }
);

// Logout route
router.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
});

//logout route
router.get("/logout", (req, res , next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
});

module.exports = router;
