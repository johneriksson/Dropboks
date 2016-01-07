module.exports = function(router, passport) {
    
    router.use(function(req, res, next) {
        if(!req.isAuthenticated()) {
            return next();
        }

        res.redirect("/home");
    });
    
    router.get("/", function(req, res) {
        res.redirect("/auth/login");
    });
    
    //Serve login page
    router.get("/login", function(req, res) {
        res.render("login.ejs", { message: req.flash("loginMessage") });
    });

    //POST login
    router.post("/login", passport.authenticate("local-login", {
        successRedirect: "/home",
        failureRedirect: "/auth/login",
        failureFlash: true
    }));
    
    //Serve signup page
    router.get("/signup", function(req, res) {
        res.render("signup.ejs", { message: req.flash("signupMessage") });
    });
    
    //POST signup
    router.post("/signup", passport.authenticate("local-signup", {
        successRedirect: "/home",
        failureRedirect: "/auth/signup",
        failureFlash: true
    }));
    
    router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
    
    router.get("/facebook/callback", passport.authenticate("facebook", {
        successRedirect: "/home",
        failureRedirect: "/auth/login"
    }));
    
    router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
    
    router.get("/google/callback", passport.authenticate("google", {
        successRedirect: "/home",
        failureRedirect: "/auth/login"
    }));
    
    //404
    router.get("*", function(req, res) {
        res.render("404.ejs");
    });

};