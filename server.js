var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var passportLocal = require("passport-local");
var flash = require("connect-flash");
var MongoStore = require("connect-mongo")(session);

//Setup
var dir = __dirname + "/public";
require("./config/passport")(passport);
app.use(express.static(dir));
app.use(cookieParser());
app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60
    }),
    secret: "secret",
    saveUninitialized: true,
    resave: true
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set("view engine", "ejs");

//DB
var configDB = require("./config/database");
mongoose.connect(configDB.url);

//Routes
var auth = express.Router();
require("./app/routes/auth")(auth, passport);
app.use("/auth", auth);

var secure = express.Router();
require("./app/routes/secure")(secure, passport);
app.use("/", secure);

//Launch
var port = 60000
app.listen(port);
console.log("Server running on port " + port);