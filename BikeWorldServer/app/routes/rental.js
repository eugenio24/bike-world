const express = require('express');
const router = express.Router();
const Bike = require('../models/bike'); // get bike mongoose model
const RentalPoint = require('../models/rentalPoint'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Booking = require('../models/booking.js') // get booking model
const { db } = require('../models/bike');

// ---------------------------------------------------------
// route to add new rental point
// ---------------------------------------------------------
router.post('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    // find the rental Point
	let rentalPointAlreadyExists = await RentalPoint.findOne({
		name: req.body.name
	}).exec();
	
	// rental point already exists
	if (rentalPointAlreadyExists) {
		res.json({ success: false, message: 'Creation rental point failed. Rental point already exists.' });
		return;	//to stop the execution of the function	
	}

    //save user in the db
    const newRentalPoint = new RentalPoint({name: req.body.name, address: req.body.address, lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng), type: req.body.type,bikeNumber: 0});
    await newRentalPoint.save();

	res.json({
		success: true,
		message: 'New Rental Point added!'
	});

});


// ---------------------------------------------------------
// route to get rental point
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the rental points
	let rentalPoints = await RentalPoint.find( { 'bikeNumber': {$gt : 0 }}).exec();	
	res.json({rentalPoints});
});

// ---------------------------------------------------------
// route to get rental point name
// ---------------------------------------------------------
router.get('/name', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the rental points
	let rentalPoints = await RentalPoint.find( { }, { name : 1}).exec();
	res.json({rentalPoints});
});

// ---------------------------------------------------------
// route to delete rental point
// ---------------------------------------------------------
router.delete('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// remove the rental points
	await RentalPoint.deleteOne( { name: req.query.name}).exec();

	// remove all bike associated to this rental point
	await Bike.deleteMany( { rentalPointName: req.query.name}).exec();

	res.json({
		success: true,
		message: 'Rental Point deleted!'
	});
});

// ---------------------------------------------------------
// route to update rental point info
// ---------------------------------------------------------
router.put('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    //update rental point in the db
	await RentalPoint.updateOne({'name': req.body.name}, {$set: {'address': req.body.address,'lat': req.body.lat, 'lng': req.body.lng, 'type': req.body.type}});

	res.json({
		success: true,
		message: 'Rental point info updated!'
	});

});

// ---------------------------------------------------------
// route to get rental point based on the type
// ---------------------------------------------------------
router.get('/type', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	let type = req.query.type;
	
	// find the rental points
	let rentalPoints = await RentalPoint.find( { 'type': type, 'bikeNumber': {$gt : 0 } }).exec();	
	res.json({rentalPoints});
});

// ---------------------------------------------------------
// route to get rental point based on the bike availability
// ---------------------------------------------------------
router.get('/date', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	let dateSearch = req.query.date;
	// find all the rental points
	let allRentalPoints = await RentalPoint.find( { }).exec();

	//find booking	
	let bookings = await Booking.aggregate([
		{ $match: { date: { $gte: new Date(dateSearch),
			$lte: new Date(dateSearch) }}}, 
		{ $group : { _id : "$rentalPointName", count : { $sum : 1 } } }
	  ]);
	
	for(let i = 0; i < bookings.length; i++){
		for(let y = 0; y < allRentalPoints.length; y++){
			if(bookings[i]._id == allRentalPoints[y].name){
				allRentalPoints[y].bikeNumber -= bookings[i].count;
			}
		}
	}

	let rentalPoints = [];

	for(let i = 0; i < allRentalPoints.length; i++){
		if(allRentalPoints[i].bikeNumber > 0){
			rentalPoints.push(allRentalPoints[i]);
		}
	}

	res.json({rentalPoints});

});

module.exports = router;