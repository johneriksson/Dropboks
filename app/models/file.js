var mongoose = require("mongoose");

var fileSchema = mongoose.Schema({
    filename: String,
    private: Boolean,
    owner: String,
    timestamp: String,
    file_id: String,
    size: String
});

module.exports = mongoose.model("File", fileSchema);