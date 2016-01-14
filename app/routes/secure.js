var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({uploadDir: "./uploads/"});

var bson = require("bson");
var BSON = new bson.BSONPure.BSON();
var fs = require("fs");
var utf8 = require("utf8");
var Grid = require('gridfs-stream');
var moment = require("moment");

var File = require("../models/file");
var User = require("../models/user");

module.exports = function(router, mongoose) {
    Grid.mongo = mongoose.mongo;
    
    router.use(function(req, res, next) {
        if(req.isAuthenticated()) {
            return next();
        }

        res.redirect("/auth/login");
    });
    
//    router.get("/", function(req, res) {
//        res.redirect("/home");
//    });
    
    //Serve home page
    router.get("/home", function(req, res) {
        res.render("home.ejs", { user: req.user });
    });
    
    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/auth/login");
    });
    
    router.get("/searchUsers/:username", function(req, res) {
        var username = req.params.username;
        
        User.find({"username": {"$regex": username, "$options": "i"}}, function(err, docs) {
            if(err)
                res.status(500).send();
            else {
                var response = [];
                docs.forEach(function(doc) {
                    response.push(doc.username);
                });
                res.json(response);
            }
        })
    });
    
    router.post("/upload", multipartyMiddleware, function(req, res) {
        if(req.files.file != undefined) {
            var uploadedFile = req.files.file;
            var private = req.headers.private;
            
            var gfs = Grid(mongoose.connection.db);

            var writestream = gfs.createWriteStream({
                filename: uploadedFile.originalFilename
            });
            fs.createReadStream("./" + uploadedFile.path).pipe(writestream);

            writestream.on('close', function (file) {
                var newFile = new File();
                newFile.filename = uploadedFile.originalFilename;
                newFile.private = private != undefined ? private : false;
                newFile.owner = req.user._id;
                newFile.timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
                newFile.file_id = file._id;
                newFile.size = file.length;
                
                newFile.save(function(err, doc) {
                    if(err) {
                        res.json({success: false});
                    } else {
                        res.json({sucess: true});
                    }
                });
                
                fs.unlinkSync(uploadedFile.path);
            });
        }
    });
    
    router.get("/file/:fileid", function(req, res) {
        var fileid = req.params.fileid;
        
        process.nextTick(function() {
            File.findOne({"_id": fileid}, function(err, file) {
                if(err)
                    res.status(500).send();
                if(!file)
                    res.status(400).send();
                else {
                    var path = './uploads/' + file.filename;
                    var gfs = Grid(mongoose.connection.db);
                    
                    var fs_write_stream = fs.createWriteStream(path);
        
                    var readstream = gfs.createReadStream({
                         _id: file.file_id
                    });
                    readstream.pipe(fs_write_stream);

                    fs_write_stream.on('close', function() {
                        res.download(path);
                    });
                }
            });
        });
    });
    
    router.post("/remove", function(req, res) {
        var fileId = req.body.fileId;
        
        File.findOne({"_id": fileId}, function(err, doc) {
            if(err)
                res.status(500).send();
            if(!doc)
                res.status(400).send();
            else {
                if(doc.owner != req.user._id)
                    res.status(403).send();
                else {
                    var gfs = Grid(mongoose.connection.db);
                    
                    gfs.remove({"_id": doc.file_id}, function (err) {
                        if(err)
                            res.status(500).send();
                        else {
                            File.remove({"_id": fileId}, function(err) {
                                if(err)
                                    res.status(500).send();
                                else
                                    res.status(200).send();    
                            })
                        }
                    });
                }
            }
        });
    });
    
    router.get("/private", function(req, res) {
        var userId = req.user._id;
        
        File.find({"owner": userId}, function(err, docs) {
            if(err)
                res.status(500).send();
            else {
                res.json(docs);
            }
        });
    });
    
    router.get("/public/:username", function(req, res) {
        var username = req.params.username;
        
        User.findOne({"username": username}, function(err, doc) {
            if(err)
                res.status(500).send();
            if(!doc)
                res.status(400).send();
            else {
                File.find({"owner": doc._id, "private": false}, function(err, docs) {
                    if(err)
                        res.status(500).send();
                    else {
                        var response = [];
                        docs.forEach(function(file) {
                            response.push({
                                filename: file.filename,
                                size: file.size,
                                timestamp: file.timestamp
                            });
                        });
                        res.json(response);
                    }
                });
            }
        });
    });
    
    //404
    router.get("*", function(req, res) {
        res.render("404.ejs", { user: req.user });
    });
    
}