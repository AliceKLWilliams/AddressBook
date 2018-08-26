let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let methodOverride = require("method-override");

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

// Set up method override
app.use(methodOverride("_method"));

app.get("/people/new", (req, res) => {
	res.render("person/new");
});

app.get("/people/:id/edit", (req, res) => {
	Person.findById(req.params.id)
	.then(person => {
		res.render("person/edit", {person});

	}).catch(err => {
		res.redirect("/error");
	});

});

app.put("/people/:id", (req, res) => {
	Person.updateOne({_id: req.params.id}, req.body)
	.then((person) => {
		res.redirect("/");
	})
	.catch((err) => {
		res.redirect("/error");
	});
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
	Person.find({})
	.then(people => {
		res.render("index", {people});
	}).catch(err => {
		res.redirect("/error");
	});
});

app.listen(3000);