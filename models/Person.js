let mongoose = require("mongoose");

let Schema = mongoose.Schema;

let personSchema = new Schema({
	name:String,
	age:Number
});

module.exports = mongoose.model("Person", personSchema);