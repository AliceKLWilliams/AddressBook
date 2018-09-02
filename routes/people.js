let express = require("express");
let router = express.Router();

let Person = require("../models/Person");
let Group = require("../models/Group");

router.get("/people/new", (req, res) => {
	Group.find({}).then(groups => {
		res.render("person/new", {groups});
	})
	.catch(err => {
		res.redirect("/error");
	});
});

router.get("/people/:id", (req, res) => {
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

router.get("/people/:id/edit", (req, res) => {
	let getters = [Person.findById(req.params.id), Group.find({})];

	Promise.all(getters)
	.then(([person, groups]) => {
		res.render("person/edit", {person, groups});
	}).catch(err => {
		res.redirect("/error");
	});

});

router.delete("/people/:id", (req, res) => {
	Person.findByIdAndRemove(req.params.id)
	.then((deletedPerson) => {
		res.redirect("/");
	}).catch(err => {
		res.redirect("/error");
	});
});

router.put("/people/:id", (req, res) => {
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
		birthday: formatBirthday(req.body.birthday),
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

router.post("/people", (req, res) => {
	const prefix = "group-";

	let groups = [];
	for(let key in req.body){
		if(key.startsWith(prefix)){
			let id = key.substring(prefix.length);
			groups.push(id);
		}
	}

	let formattedBday = formatBirthday(req.body.birthday);

	Person.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthday: formattedBday,
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

function formatBirthday(date){
	let birthday = new Date(date);

	let day = birthday.getDate();
	let month = birthday.getMonth() + 1;
	let year = birthday.getFullYear();
	if(month < 10) month = `0${month}`;
	if (day < 10) day = `0${day}`;

	return `${year}-${month}-${day}`;
}

module.exports = router;