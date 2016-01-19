/*
* Manages reading / saving a timestamp value to the file system
*/

'use strict';

var file,
	fs = require('fs');

var mod = {
	getLastTimeStamp: function(callback){

		//todo: if there is an error (e.g. file doesn't exist), read all of history. probably should send an email and require this to be run manually. 
		fs.readFile(file, function(err,data){
			if(err){
				return callback(err);
			}
			callback(null,data);
		});
	},
	setLastTimeStamp: function(timestamp, callback){

		fs.writeFile(file, timestamp, function(err){
			if(err){
				console.log(err);
				return callback(err);
			}
			callback(null);
		});
	}
};

function initConfig(settings){
	file =settings.file;
	return mod;
}

module.exports = initConfig;
