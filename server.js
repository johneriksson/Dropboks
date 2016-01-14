var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");
var MongoStore = require("connect-mongo/es5")(session);

//Setup
var dir = __dirname + "/public";
app.use(express.static(dir));
require("./config/passport")(passport);
app.use(cookieParser());
app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60
    }),
    secret: "secret",
    saveUninitialized: false,
    resave: true
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
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
require("./app/routes/secure")(secure, mongoose);
app.use("/", secure);

//Launch
var port = 60000
app.listen(process.env.PORT || port);
console.log("Server running on port " + port);
