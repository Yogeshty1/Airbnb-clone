module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Store the original URL, but if it's a review submission, store the referring page
        let returnTo = req.originalUrl;
        // If it's a review POST route, redirect to the listing page instead
        if (req.originalUrl.includes('/reviews') && req.method === 'POST') {
            returnTo = req.headers.referer || `/listings/${req.params.id}`;
        }
        req.session.returnTo = returnTo; 
        
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};

// saveReturnTo looks correct and should now function properly:
module.exports.saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        delete req.session.returnTo;
    }
    next();
};