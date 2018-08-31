const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let groupSchema = new Schema({
	name:String,
	colour: String
});

module.exports = mongoose.model("Group", groupSchema);