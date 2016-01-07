var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({uploadDir: "./uploads/"});

var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var maxFileSize = 1024 * 1024 * 16; // 16 MB
var fs = require("fs");

var moment = require("moment");

var File = require("../models/file");

module.exports = function(router, passport) {
    
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
        res.render("home.ejs", { user: req.user });
    });
    
    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/auth/login");
    });
    
    router.post("/upload", multipartyMiddleware, function(req, res) {
        if(req.files.file != undefined) {
            var file = req.files.file;
            console.log(file);
            
            if(file.size > maxFileSize) {
                res.json({success: false});
                return;
            }
            
            fs.readFile(file.path, function (err, data) {
                if (err) {
                    //Error
                    console.error(err);
                    res.json({success: false});
                    
                    fs.unlinkSync(file.path);
                } else {
                    //Success
                    process.nextTick(function() {
                        var filedata = BSON.serialize(data, false, true, false);
                        
                        var newFile = new File();
                        newFile.filename = file.originalFilename;
                        newFile.private = false;
                        newFile.size = file.size;
                        newFile.owner = req.user._id;
                        newFile.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
                        newFile.data = filedata;
                        
                        newFile.save(function(err, savedFile) {
                            if(err)
                                res.json({success: false});
                            else {
                                res.json({success: true});
                                console.log(savedFile._id);
                            }
                        });
                        
                        fs.unlinkSync(file.path);
                    });
                }
            });
        }
    });
    
    router.get("/file/:fileid", function(req, res) {
        process.nextTick(function() {
            File.findOne({ "_id": req.params.fileid }, function(err, file) {
                if(err)
                    res.status(500).send();
                if(!file)
                    res.status(404).send();
                else {
                    console.log(file.filename);
                    
                    var path = "./uploads/" + file.filename;
                    var data = BSON.deserialize(file.data);
                    fs.writeFile(path, data, function(err) {
                        if(err){
                            console.log(err);
                            res.status(500).send();
                        } else {
                            res.download(path);
                            fs.unlinkSync(path);
                        }
                    });
                    res.status(200).send();
                }
            });
        });
    });
    
    router.get("/files/", function(req, res) {
        
    });
    
    //404
    router.get("*", function(req, res) {
        res.render("404.ejs", { user: req.user });
    });
    
}