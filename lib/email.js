'use strict'

var config = {}, 
	mailgun;

var mod = {
	sendMail: function(subject, message, callback){

		var data = {
		  from: config.from,
		  to: config.to,
		  subject: subject,
		  text: message
		};

		console.log(data);
		 
		mailgun.messages().send(data, function (error, body) {
			callback(error);
		});
	}
};

function initConfig(settings){

	mailgun = require('mailgun-js')({apiKey: settings.apikey, domain: settings.domain});
	config.from = settings.from; 
	config.to = settings.to; 
	return mod;

}


module.exports = initConfig;