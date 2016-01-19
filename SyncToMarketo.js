
var 
	fs = require('fs'), 
	path = require('path'),
	errogLogPath = path.resolve(__dirname) +'/errors/',
	env = process.env.node_env  || 'test', 
	config = require('./config.js'), 
	lastTimeStamp, 
	timestamp = require('./lib/timestamp.js')({
		file: path.resolve(__dirname) + '/timestamp.txt'
	}),
	logWriter = require('./lib/log.js'), 
	marketo = require('./lib/marketo.js')({
		apiUrl: config[env].marketo.apiUrl,
		authUrl: config[env].marketo.authUrl,
		clientId: config[env].marketo.clientId,
		clientSecret: config[env].marketo.clientSecret, 
		batchSize: config[env].marketo.batchSize,
		logFilePath: path.resolve(__dirname)+'/logs/', 
		mailgun: {
			apikey: config[env].mailgun.apikey, 
			domain: config[env].mailgun.domain, 
			to: config[env].mailgun.to,
			from: config[env].mailgun.from
		}, 
		logWriter: logWriter
	}), 
	lanyon = require('./lib/lanyon.js')({
		userAPIURL: config[env].lanyon.userAPIURL,
		orderAPIURL: config[env].lanyon.orderAPIURL,
		token: config[env].lanyon.token
	});

//load the timestamp from the last API call so we only get new / modified users
timestamp.getLastTimeStamp(function(err,data){
	if(err){
		console.log('error with reading timestamp');
		return logWriter(errorLogPath + 'timestamp', err);
	}
	//get the lanyon data
	lanyon.getData(data, mapUser, function(err, data){
		if(err){
			console.log('error with lanyon api');
			return logWriter(errogLogPath + 'lanyon', err);
		}
		//load the user data into marketo
		marketo.loadUsers(data, function(err,data){
			if(err){
				console.log('error with marketo');
				console.log(err);
				return logWriter(errogLogPath + 'marketoauth', err);
			}
			//save the timestamp of the lanyon API call
			timestamp.setLastTimeStamp(lanyon.lastTimeStamp, function(err){
				//clean up 
				if(err){
					console.log('error setting time stamp');
					return logWriter(errogLogPath + 'timestamp', err);
				}
			});
		});
	});
});



//maps lanyon user data to a marketo user template
function mapUser(user){

	//format the dates 
	var formattedCreatedDate, 
		formattedOrderDate;

	if(typeof user["create-date"][0] !== 'undefined'){
		formattedCreatedDate = (new Date(user["create-date"][0])).toISOString();
	}
	if(typeof user.orderData.maxOrderDate !== 'undefined' && user.orderData.maxOrderDate !== '' ){
		formattedOrderDate = (new Date(user.orderData.maxOrderDate)).toISOString();
	}

	var data = {
		firstName: user.firstName[0] || '', 
		lastName: user.lastName[0] || '', 
		email: user.email[0] || '', 
		mainPhone: user.phoneNumber[0] || '',
		company: user.companyName[0] || '', 
		title: user.jobTitle[0] || '', 
		address : user.address1[0] + user.address2[0] + user.address3[0],
		country: user.countryID[0] || '',
		city: user.city[0] || '', 
		state: user.stateID[0] ||'', 
		postalCode: user.zip[0] || '',
		Lanyon_User_ID__c: user.userRef[0] || '',
		Lanyon_Registered_Flag__c: user.registered[0] || 'false', 
		Lanyon_Created_Date__c: formattedCreatedDate || '',
		Lanyon_Paid_Flag__c: user.paid[0] || 'false', 
		Lanyon_Total_Paid_Amt__c: user.orderData.totalPaid || 0,
		Lanyon_Order_Date__c: formattedOrderDate || '', 
		Lanyon_Order_Count__c: user.orderData.orderCount || 0, 
		Lanyon_Paid_in_Full__c: user.orderData.paidInFull || 'false', 
		Lanyon_Guest_Package__c: user.orderData.guestPackage || 'false', 
		Lanyon_Total_Base_Amt__c: user.orderData.baseAmt || 0,
		//lanyonClassification: typeof user["report-classification"] !== 'undefined' ? user["report-classification"][0] : '',
		Lanyon_Attendee_Type__c: typeof user["Attendee-Type"] !== 'undefined' ? user["Attendee-Type"][0] : '',
		Lanyon_Reg_Codes__c: typeof user["regcodes"] !== 'undefined' && typeof user["regcodes"][0]["regcode"] !== 'undefined' ? user["regcodes"][0]["regcode"].join(',') :''
	}

	//remove keys from the object that are not used 
	for(var keys in data){
		if(data[keys] === null || data[keys] === '' || typeof data[keys] === 'undefined'){
			delete data[keys];
		}
	}
	console.log(data);
	return data;

}








// find the last timestamp that the program was run to only pull records modififed since x 

//if the file doesn't exist or is empty, we will omit the since parameter 

//call the lanynon API 

//parse the Lanyon API response (convert from XML to JS)

//iterate over the newly registered users     


//map the attributes to the marketo template 

//push the users onto the marketo API call 

//fire the marketo API call 

//parse the marketo API response 

//log the response 

//look for errors and log them 

//send an email with the status





//clear the batch of users (if the program does not shutdown)
//update the last timestamp file









