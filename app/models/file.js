var mongoose = require("mongoose");

var fileSchema = mongoose.Schema({
    filename: String,
    private: Boolean,
    size: Number,
    owner: String,
    timestamp: String,
    data: String
});

module.exports = mongoose.model("File", fileSchema);