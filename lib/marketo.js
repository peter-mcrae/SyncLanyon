/*
* Manages commmunication with Marketo, including sharding data across API calls so API limits are not exceeded.
*/

'use strict';

var request = require('request'),
	userBatches = [[]], 
	config = {},
	mail;


var mod = {

	getMarketoAuthToken: function(callback){
		var url = config.authUrl + '&client_id=' + config.clientId + '&client_secret=' + config.clientSecret;
		console.log(url);
		request(url, function(error, response, body){
			if(error){
				console.log(error);
				return callback(error);
			}
			callback(null,JSON.parse(body).access_token);
		});
		
	},

	addUserToBatch: function(user){

		var batch = userBatches[userBatches.length -1]; 
		//if there are x users on a batch, create a new batch
		if(batch.length >= config.batchSize){
			userBatches.push([]);
			batch = userBatches[userBatches.length -1]; 
		}
		batch.push(user);
	},

	loadUsers: function(users, callback){
		//Users can be an object or array. If it's a single object add to to an emtpy array
		users = Object.prototype.toString.call(users) === '[object Array]' ? users : [users];

		//interate over the users and add them to a batch
		for(var i=0,l=users.length;i<l;i++){
			this.addUserToBatch(users[i]);
		}

		this.executeBatchUserLoad(callback);
	},

	executeBatchUserLoad: function(callback){

		var done= userBatches.length, 
			_self = this;
		for(var i=0,l=userBatches.length; i<l;i++){
			this.makeMarketoAPICall(userBatches[i], function(err, data){
				if(err){return callback(err);}
				_self.processMarketoResponse(data, function(err, data){
					done--; 
					if(done === 0){
						console.log('batches done');
						callback(null);
					}
				});
			});
		}
	},

	makeMarketoAPICall: function(users, callback){
		
		//if there are no users specific return 
		if(users.length === 0){
			return callback(null, "no leads");
		}
		//todo don't need to get a new auth token if one already exists and has not expired.
		this.getMarketoAuthToken(function(err, token){
			if(err){
				console.log(err);
				return callback(err);	
			} 
			var url = config.apiUrl + '?access_token=' +  token, 
				body = {
					input: users 
				};
			console.log(url);
			console.log(users[0]);
			request({uri: url, method:'POST', body:body, json:true}, function(error, response, body){
				if (!error && response.statusCode == 200) {
		    		callback(null, body);
		  		}else{
		  			console.log(error);
		  			callback(error);
		  		}
			});
		});

	},
	
	processMarketoResponse: function(data, callback){

		//log the response, don't need to wait for the callback
		var filePath = config.logFilePath + 'marketo'  + (new Date).toString();

		config.logWriter(filePath, data); 

		//if there is an error do something


		var createdCounter=0, skippedCounter =0, updatedCounter=0;
		//look for error at the record level
		
		if(data.success && data.result){
			for(var i=0,l=data.result.length;i<l;i++){
				if(data.result[i].status === "created"){
					createdCounter++;
				}
				if(data.result[i].status === "skipped"){
					skippedCounter++;
				}
				if(data.result[i].status === "updated"){
					updatedCounter++;
				}
			}
		}


		var message = 'Marketo API Synced'
			message += '\n' + 'RequestID: ' + data.requestId; 
			message += '\n' + 'Success: ' + data.success;
			message += '\n' + 'Errors: ' + JSON.stringify(data.errors || {}); 
			message += '\n' + 'Time: ' + (new Date).toString(); 
			message += '\n' + 'NumRecords: ' + (data.result || []).length;
			message += '\n' + 'CreatedCount: ' + createdCounter;
			message += '\n' + 'SkippedCount: ' + skippedCounter;
			message += '\n' + 'UpdatedCount: ' + updatedCounter;

		//send an email with the summary
		console.log(message);
		mail.sendMail('Lanyon Marketo Sync', message, function(err){
			callback(err);
		});
		
	}
};

function initConfig(settings){

	config.authUrl = settings.authUrl;
	config.apiUrl= settings.apiUrl; 
	config.clientId = settings.clientId;
	config.clientSecret= settings.clientSecret;
	config.batchSize = settings.batchSize; 
	config.logFilePath = settings.logFilePath;
	config.mailgun = settings.mailgun; 
	config.logWriter = settings.logWriter;

	mail = require('./email.js')(config.mailgun);
	return mod;

}

module.exports = initConfig;



