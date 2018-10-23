let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let methodOverride = require("method-override");

let url = require("url");

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

// Make sure matches the mongoose schema
const categories = {
	birthday: "Birthday",
	age: "Age",
	address: "Address",
	postcode: "Postcode",
	mobile: "Mobile",
	homePhone: "Home Number",
	groups: "Groups"
}

app.get("/", (req, res) => {

	let queryData = url.parse(req.url, true).query;
	let getterPromises = [Person.find({}).populate("groups"), Group.find({})];

	Promise.all(getterPromises)
	.then(([people, groups]) => {
		let filteredPeople = people;

		// Filter for search term (only text fields)
		if(queryData["query"]){
			let query = queryData["query"];

			filteredPeople = filteredPeople.filter(person => {
				let include = false;

				let searchableFields = ["firstName", "lastName", "birthday", "address", "postcode"];

				searchableFields.forEach(field => {
					if(person[field]){
						include |= person[field].includes(query);
					}
				});

				include |= `${person.firstName} ${person.lastName}`.includes(query);

				return include;
			});
		}


		// Filter for Group
		if(queryData["filterGroups"]){ // If we have selected groups
			let filterType = queryData["groupFilter"];

			filteredPeople = filteredPeople.filter(person => {
				let personGroupIds = person.groups.map(group => group._id.toString());
				if(filterType === "some"){
					return [...queryData["filterGroups"]].some(groupID => personGroupIds.includes(groupID));
				} else{
					return [...queryData["filterGroups"]].every(groupID => personGroupIds.includes(groupID));
				}

			});
		}

		// Set Ages
		filteredPeople.forEach(person => setAge(person));

		// Find Table Columns
		let tableColumns = [];
		for(key in queryData){
			if(categories.hasOwnProperty(key)){
				tableColumns.push(queryData[key]);
			}
		}

		

		res.render("index", {
			people: filteredPeople, 
			groups, 
			categories, 
			columns:tableColumns,
			groupFilter:queryData["filterGroups"], 
			groupCondition: queryData["groupFilter"]
		});
	});
	
});

app.get("/", (req, res) => {
	let getters = [Person.find({}).populate("groups"), Group.find({})];

	Promise.all(getters)
	.then(([people, groups]) => {
		people.forEach(person => setAge(person));

		res.render("index", {people, groups, categories});
	}).catch(err => {
		res.redirect("/error");
	});
});

function setAge(person){
	if(person.birthday){
		let birthday = new Date(person.birthday).getTime();
		let now = Date.now();

		let millDifference = now - birthday;

		let years = (((((millDifference / 1000) / 60) / 60) / 24) /365);

		person.age = Math.floor(years);
	} else {
		person.age = "N/A";
	}
}

app.listen(3000);