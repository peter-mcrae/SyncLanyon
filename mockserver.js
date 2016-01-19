var express = require('express');
var app = express();
var bodyParser = require('body-parser'), 
	fs = require('fs'), 
	xml2js = require('xml2js');

app.use(bodyParser.json()); // for parsing application/json



// respond with "hello world" when a GET request is made to the homepage
app.get('/marketoauth', function(req, res) {
	res.json({
	    "access_token": "cdf01657-110d-4155-99a7-f986b2ff13a0:int",
	    "token_type": "bearer",
	    "expires_in": 3599,
	    "scope": "apis@acmeinc.com"
	});
});

app.post('/lanyonapi', function(req, res) {
	fs.readFile('mocks/lanyonapi.xml', function(err, data){
		 res.send(data);
		 /*xml2js.parseString(data, function(err,data){
		 	//res.json(data)
		 	res.json(data['user-data'].user.length);
		 });*/
	});
 
});

app.post('/orderapi', function(req, res) {
	fs.readFile('mocks/lanyonOrderApi.xml', function(err, data){
		 //res.send(data);
		 xml2js.parseString(data, function(err,data){
		 	//res.json(data)
		 	res.json(data);
		 });
	});
 
});

app.post('/marketoleads', function(req, res) {
	//console.log(req.body); 
	var response=[];

	for(var i =0,l=req.body.input.length;i<l;i++){
		response.push({
			id: i, 
			status: "created",
			email: req.body.input[i].email
		});
	}

	res.json({  
	   "requestId":"e42b#14272d07d78",
	   "success":true,
	   "result":response
	});

});

app.listen(9000);








