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

app.get("/people/:id", (req, res) => {
	Person.findById(req.params.id)
	.then(person => {
		if(person){
			res.render("person/show", {person});
		} else{
			res.redirect("/error");
		}
	})
	.catch(err => {
		res.redirect("/error");
	});
});

app.get("/people/:id/edit", (req, res) => {
	Person.findById(req.params.id)
	.then(person => {
		let birthday = new Date(person.birthday);
		let day = birthday.getDate();
		let month = birthday.getMonth() + 1;
		let year = birthday.getFullYear();

		if(month < 10) month = `0${month}`;
		if (day < 10) day = `0${day}`;

		let formattedBday = `${year}-${month}-${day}`;

		res.render("person/edit", {person, birthday:formattedBday});

	}).catch(err => {
		res.redirect("/error");
	});

});

app.delete("/people/:id", (req, res) => {
	Person.findByIdAndRemove(req.params.id)
	.then((deletedPerson) => {
		res.redirect("/");
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
		birthday:req.body.birthday
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
		people.forEach(person => {
			let birthday = new Date(person.birthday).getTime();
			let now = Date.now();

			let millDifference = now - birthday;

			let years = (((((millDifference / 1000) / 60) / 60) / 24) /365);

			person.age = Math.floor(years);
		});


		res.render("index", {people});
	}).catch(err => {
		res.redirect("/error");
	});
});

app.listen(3000);