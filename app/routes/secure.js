var File = require("../models/file");
var User = require("../models/user");

function stringifyObj(obj) {
    return JSON.stringify(obj).replace(/\\/g, '\\\\').replace(/"/g, '\\\"');
}

module.exports = function(router, mongoose) {    
    router.use(function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }

        res.redirect("/auth/login");
    });
    
    router.get("/", function(req, res) {
        res.redirect("/home");
    });
    
    //Serve home page
    router.get("/home", function(req, res) {
        var userId = req.user._id;
        
        File.find({"owner": userId}, function(err, docs) {
            if(err)
                res.status(500).send();
            else {
                var data = {
                    user: req.user,
                    files: stringifyObj(docs),
                    owner: true
                }
                res.render("home.ejs", data);
            }
        });
    });
    
    //Serve user page
    router.get("/user/:username", function(req, res) {
        var username = req.params.username;
        
        User.findOne({"username": username}, function(err, doc) {
            if(err)
                res.status(500).send();
            else if(!doc)
                res.status(400).send();
            else {
                File.find({"owner": doc._id, "private": false}, function(err, docs) {
                    if(err)
                        res.status(500).send();
                    else {
                        var response = [];
                        docs.forEach(function(file) {
                            response.push({
                                _id: file._id,
                                filename: file.filename,
                                size: file.size,
                                timestamp: file.timestamp
                            });
                        });
                        
                        var data = {
                            user: req.user,
                            username: username,
                            files: stringifyObj(response),
                            owner: false
                        }
                        res.render("user.ejs", data);
                    }
                });
            }
        });
    });
    
    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/auth/login");
    });
    
    //404
    router.get("*", function(req, res) {
        res.render("404.ejs", { user: req.user });
    });
    
}