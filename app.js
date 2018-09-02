let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let methodOverride = require("method-override");

let mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/AddressBook", {useNewUrlParser: true});

let Person = require("./models/Person");
let Group = require("./models/Group");

let GroupRoutes = require("./routes/groups");
app.use(GroupRoutes);

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
	Group.find({}).then(groups => {
		res.render("person/new", {groups});
	})
	.catch(err => {
		res.redirect("/error");
	});
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
	let getters = [Person.findById(req.params.id), Group.find({})];


	Promise.all(getters)
	.then(([person, groups]) => {
		if(person.birthday){
			let birthday = new Date(person.birthday);
			let day = birthday.getDate();
			let month = birthday.getMonth() + 1;
			let year = birthday.getFullYear();

			if(month < 10) month = `0${month}`;
			if (day < 10) day = `0${day}`;

			let formattedBday = `${year}-${month}-${day}`;

			res.render("person/edit", {person, birthday:formattedBday, groups});
		} else{
			res.render("person/edit", {person, birthday:"", groups});
		}

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
	const prefix = "group-";

	let groups = [];
	for(let key in req.body){
		if(key.startsWith(prefix)){
			let id = key.substring(prefix.length);
			groups.push(id);
		}
	}

	Person.updateOne({_id: req.params.id}, {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthday: req.body.birthday,
		address: req.body.address,
		postcode: req.body.postcode,
		mobile: req.body.mobile,
		homePhone: req.body.homePhone,
		groups
	})
	.then((person) => {
		res.redirect("/");
	})
	.catch((err) => {
		res.redirect("/error");
	});
});

app.post("/people", (req, res) => {
	const prefix = "group-";

	let groups = [];
	for(let key in req.body){
		if(key.startsWith(prefix)){
			let id = key.substring(prefix.length);
			groups.push(id);
		}
	}

	Person.create({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			birthday: req.body.birthday,
			address: req.body.address,
			postcode: req.body.postcode,
			mobile: req.body.mobile,
			homePhone: req.body.homePhone,
			groups
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


		res.render("index", {people, groups});
	}).catch(err => {
		res.redirect("/error");
	});
});


// from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

app.listen(3000);