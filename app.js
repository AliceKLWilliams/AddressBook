let express = require("express");
let app = express();

let bodyParser = require("body-parser");

let mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/AddressBook");

let Person = require("./models/Person");

// Use EJS for templating
app.set("view engine", "ejs");

// Hold JS/CSS in public folder
app.use(express.static("public"));

// Set up body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get("/people/new", (req, res) => {
	res.render("person/new");
});


app.post("/people", (req, res) => {
	Person.create({
		name:req.body.name,
		age:req.body.age
	}, (err) => {
		if(err){
			res.redirect("/error");
		} else {
			res.redirect("/");
		}
	});
});

app.get("/error", (req, res) => {
	res.render("error");
});

app.get("/", (req, res) => {
	Person.find({}, (err, people) => {
		if(err) return res.redirect("/error");

		res.render("index", {people});
	});
});

app.listen(3000);