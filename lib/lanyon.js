/*
* Manages connectivity to the Layon user and order API's
*/

'use strict'


var config = {}, 
	request = require('request'), 
	xml2js = require('xml2js');

var mod = {
	lastTimeStamp:'',
	getData: function(timestamp, mapFunction, callback){

		function makeLanyonUserAPICall(callback){
			var url = config.userAPIURL + '?apiToken=' +config.token + '&since=' + timestamp;
			console.log(url);
			request.post(url, function(error, response, body){
				if (!error && response.statusCode == 200) {
		    		xml2js.parseString(body, function(error,result){
		    			if(error){
		    				console.log(error);
		    				return callback(error);
		    			}

		    			callback(null, result);
		    		});
		  		}else{
		  			console.log(error);
		  			callback(error);
		  		}
			});
		}

		function makeLanyonOrderAPICall(user, callback){
			var userRef = user.userRef[0];
			var url = config.orderAPIURL + '?apiToken=' +config.token + '&userRef=' + userRef;
			console.log(url);
			request.post(url, function(error, response, body){
				if (!error && response.statusCode == 200) {
		    		xml2js.parseString(body, function(error,result){
		    			if(error){
		    				console.log(error);
		    				return callback(error);
		    			}
		    			var userOrderData = {
		    				orderCount: 0, 
		    				totalPaid:0,
		    				baseAmt: 0,
		    				guestPackage: 'false', 
		    				paidInFull: 'false', 
		    				maxOrderDate: '' 
		    			};

		    			var paidInFullFlag = true, 
		    				guestPackageFlag = false, 
		    				maxOrderDate;
		    			
		    			//iterate over all of the orders and sum up the pricing + count
		    			if(typeof result.api.orderData !== 'undefined' && typeof result.api.orderData[0] !== 'undefined' && typeof result.api.orderData[0].order !== 'undefined'){
		    				
		    				//make the orders an array if it's a single order and returns as an object
		    				var orders = Object.prototype.toString.call(result.api.orderData[0].order) === '[object Array]' ? result.api.orderData[0].order : [result.api.orderData[0].order], 
		    					price, basePrice;
		    		
		    				for(var i=0,l=orders.length;i<l;i++){
		    					if(orders[i].orderType[0] === 'Cancel'){
		    						//just incase the total price for cancellations is not negative
		    						price = Math.abs(parseFloat(orders[i].totalPrice[0] || 0)) * -1;
		    						basePrice = Math.abs(parseFloat(orders[i].basePrice[0] || 0)) * -1;
		    						
		    					}else{
		    						price = parseFloat(orders[i].totalPrice[0] || 0);
		    						basePrice = parseFloat(orders[i].basePrice[0] || 0);
		    					}

		    					var orderDate = orders[i].orderDate[0]; 
		    					if(typeof orderDate !== 'undefined'){
		    						orderDate = new Date(orderDate);
		    						if(typeof maxOrderDate === 'undefined'  || orderDate > maxOrderDate){
		    							maxOrderDate = orderDate;
		    						}
		    					}


		    					userOrderData.totalPaid += price;
		    					userOrderData.baseAmt += basePrice;
		    					userOrderData.orderCount++; 
		    					if(orders[i].paidInFull[0] === false || orders[i].paidInFull[0] === 'false'){
									paidInFullFlag = false;	
		    					}
		    					if(orders[i].guestPackage[0] === true || orders[i].guestPackage[0] === 'true'){
									guestPackageFlag = true;	
		    					}
		    				}
							userOrderData.guestPackage = guestPackageFlag;
		    				userOrderData.paidInFull = paidInFullFlag;	
		    				userOrderData.maxOrderDate = maxOrderDate;    				
		    			}

		    			//attach order attributes to the user
		    			user.orderData = userOrderData;
		    			callback(null, user);
		    		});
		  		}else{
		  			console.log(error);
		  			callback(error);
		  		}
			});
		}

		function processLanyonUserData(data, callback){
			
			//save the timestamp of the data pull
			var queue = [], 
			registeredUserCounter = 0;
			try{
				mod.lastTimeStamp = data["user-data"]["$"].time; 
			}catch(e){
				return console.log('lanyon api failed. check ip.')
			}
			
			//loop over the users
			var users = data["user-data"].user || []; 
			console.log(users.length);
			for(var i=0, l=users.length; i<l;i++){
				//apply business logic and add the user to the result set
				//filter out test orders and get order data for each user
				if(typeof users[i].email[0] !== 'undefined' && (users[i]['This-is-for-test-users'] || ['no'])[0] !== 'yes'){
					//possible race condition. technically not since the thread will be blocked by the for loop. 
					registeredUserCounter++;
					//get additional order data for the user
					makeLanyonOrderAPICall(users[i], function(err, data){
						var user = mapFunction(data);
						queue.push(user);
						//if we are done return the queue 
						if(queue.length == registeredUserCounter){
							callback(null,queue);
						}
					});	
				}
			}
			//if there were no users that need to be added, invoke the callback so that the program completes
			if(registeredUserCounter ===0){
				callback(null, queue);
			}
		}


		makeLanyonUserAPICall(function(err, data){
			if(err){
				return callback(err); 
			}
			processLanyonUserData(data, function(err,data){
				if(err){
					return callback(err);
				}
				callback(null, data);			
			});
			

		});

	}
	
};

function initConfig(settings){

	config.userAPIURL = settings.userAPIURL;
	config.orderAPIURL = settings.orderAPIURL; 
	config.token = settings.token; 
	return mod;

}


module.exports = initConfig;