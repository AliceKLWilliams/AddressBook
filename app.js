let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let methodOverride = require("method-override");

let mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/AddressBook", {useNewUrlParser: true});

let Person = require("./models/Person");
let Group = require("./models/Group");

// Use EJS for templating
app.set("view engine", "ejs");

// Hold JS/CSS in public folder
app.use(express.static("public"));

// Set up body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Set up method override
app.use(methodOverride("_method"));

let GroupRoutes = require("./routes/groups");
app.use(GroupRoutes);

let PeopleRoutes = require("./routes/people");
app.use(PeopleRoutes);


app.get("/error", (req, res) => {
	res.render("error");
});

app.post("/", (req, res) => {

	let getters = [Person.find({}).populate("groups"), Group.find({})];

	Promise.all(getters)
	.then(([people, groups]) => {

		let filteredPeople = people;
		if(req.body.groups){


			filteredPeople = people.filter(person => {
				let personGroupIds = person.groups.map(group => group._id.toString());
				return req.body.groups.every(groupID => personGroupIds.includes(groupID));
			});
		}


		filteredPeople.forEach(person => {
			if(person.birthday){
				let birthday = new Date(person.birthday);
				let birthdayMillis = birthday.getTime();
				let now = Date.now();

				let millDifference = now - birthdayMillis;

				let years = (((((millDifference / 1000) / 60) / 60) / 24) /365);

				person.age = Math.floor(years);
				
			} else {
				person.age = "N/A";
			}
		});

		// Make sure matches the mongoose schema
		let categories = {
			birthday: "Birthday",
			age: "Age",
			address: "Address",
			postcode: "Postcode",
			mobile: "Mobile",
			homePhone: "Home Number",
			groups: "Groups"
		}

		res.render("index", {people: filteredPeople, groups, categories, columns:req.body.columns, groupFilter:req.body.groups});
	});
	
});

app.get("/", (req, res) => {
	let getters = [Person.find({}).populate("groups"), Group.find({})];

	Promise.all(getters)
	.then(([people, groups]) => {
		people.forEach(person => {
			if(person.birthday){
				let birthday = new Date(person.birthday).getTime();
				let now = Date.now();

				let millDifference = now - birthday;

				let years = (((((millDifference / 1000) / 60) / 60) / 24) /365);

				person.age = Math.floor(years);
			} else {
				person.age = "N/A";
			}
		});

		// Make sure matches the mongoose schema
		let categories = {
			birthday: "Birthday",
			age: "Age",
			address: "Address",
			postcode: "Postcode",
			mobile: "Mobile",
			homePhone: "Home Number",
			groups: "Groups"
		}


		res.render("index", {people, groups, categories});
	}).catch(err => {
		res.redirect("/error");
	});
});

app.listen(3000);