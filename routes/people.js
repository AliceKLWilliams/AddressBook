let express = require("express");
let router = express.Router();

let Person = require("../models/Person");
let Group = require("../models/Group");

router.get("/people/new", async (req, res) => {
	try {
		let groups = await Group.find({});
		res.render("person/new", {groups});
	} catch (error) {
		res.redirect("/error");
	}
});

router.get("/people/:id", async (req, res) => {
	try {
		let person = Person.findById(req.params.id);
		if(person){
			res.render("person/show", {person});
		} else{
			res.redirect("/error");
		}
	} catch (error) {
		res.redirect("/error");
	}
});

router.get("/people/:id/edit", async (req, res) => {
	let getters = [Person.findById(req.params.id), Group.find({})];

	try {
		let [person, groups] = await Promise.all(getters);
		res.render("person/edit", {person, groups});
	} catch (error) {
		res.redirect("/error");
	}
});

router.delete("/people/:id", async (req, res) => {
	try {
		await Person.findByIdAndRemove(req.params.id);
		res.redirect('/');
	} catch (error) {
		res.redirect('/error');
	}
});

router.put("/people/:id", async (req, res) => {
	const prefix = "group-";

	let groups = [];
	for(let key in req.body){
		if(key.startsWith(prefix)){
			let id = key.substring(prefix.length);
			groups.push(id);
		}
	}

	try {
		await Person.updateOne({_id: req.params.id}, {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			birthday: formatBirthday(req.body.birthday),
			address: req.body.address,
			postcode: req.body.postcode,
			mobile: req.body.mobile,
			homePhone: req.body.homePhone,
			groups
		});
		res.redirect("/");
	} catch (error) {
		res.redirect("/error");
	}
});

router.post("/people", async (req, res) => {
	const prefix = "group-";

	let groups = [];
	for(let key in req.body){
		if(key.startsWith(prefix)){
			let id = key.substring(prefix.length);
			groups.push(id);
		}
	}

	let formattedBday = formatBirthday(req.body.birthday);

	try {
		await Person.create({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			birthday: formattedBday,
			address: req.body.address,
			postcode: req.body.postcode,
			mobile: req.body.mobile,
			homePhone: req.body.homePhone,
			groups
		});
		res.redirect("/");
	} catch (error) {
		res.redirect("/error");
	}
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