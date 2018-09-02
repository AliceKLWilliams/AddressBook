let express = require("express");
let router = express.Router();

let Person = require("../models/Person");
let Group = require("../models/Group");


router.get("/group/new", (req, res) => {
	res.render("group/new");
});

router.post("/group", (req, res) => {

	let colour = hexToRgb(req.body.colour);

	// From: https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
	let luminance = ( 0.299 * colour.r + 0.587 * colour.g + 0.114 * colour.b)/255;

	let fontColour = (luminance > 0.5) ? "#000000" : "#FFFFFF";

	Group.create({
		name: req.body.name,
		colour:req.body.colour,
		fontColour
	}, (err) => {
		if(err) return res.redirect("/error");
		res.redirect("/");
	})
});

router.get("/group/:id/edit", (req, res) => {
	Group.findById(req.params.id)
	.then(group => {
		res.render("group/edit", {group});
	})
	.catch(err => {
		res.redirect("/error");
	});
});

router.put("/group/:id", (req, res) => {
	let colour = hexToRgb(req.body.colour);

	let luminance = ( 0.299 * colour.r + 0.587 * colour.g + 0.114 * colour.b)/255;

	let fontColour = (luminance > 0.5) ? "#000000" : "#FFFFFF";

	Group.updateOne({_id: req.params.id}, {
		name: req.body.name,
		colour:req.body.colour,
		fontColour
	})
	.then(group => {
		res.redirect("/");
	}).catch(err => {
		res.redirect("/error");
	});
});

router.delete("/group/:id", (req, res) => {
	let personPromise;

	if(req.query.deleteMembers){
		// Delete all members with this group
		personPromise = Person.deleteMany({groups: mongoose.Types.ObjectId(req.params.id)});
	} else{
		// Remove group reference from people
		personPromise = Person.updateMany({groups: req.params.id}, {$pull: {groups: req.params.id}});
	}

	// Delete the group
	Promise.all([Group.deleteOne({_id:req.params.id}), personPromise])
	.then(data => {
		res.redirect("/");
	}).catch(err => {
		res.redirect("/error");
	})
});

module.exports = router;