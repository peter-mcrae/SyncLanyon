'use strict';
var fs = require('fs');

module.exports = function writeLog(logFile, data){
	
	fs.writeFile(logFile + (new Date).toString(), JSON.stringify(data), function(err){

	});
}