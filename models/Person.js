let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let personSchema = new Schema({
	firstName:String,
	lastName:String,
	birthday: Date,
	address:String,
	postcode: String,
	mobile: String,
	homePhone:String
});

module.exports = mongoose.model("Person", personSchema);