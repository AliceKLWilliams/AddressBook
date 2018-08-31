let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let personSchema = new Schema({
	name:String,
	birthday: Date
});

module.exports = mongoose.model("Person", personSchema);