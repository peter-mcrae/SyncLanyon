//rename to config.js and include real data 
'use strict';

module.exports = {
	dev: {
		marketo: {
			clientId: '',
			clientSecret: '', 
			authUrl: '', 
			apiUrl: '', 
			token: '', 
			batchSize: 50
		}, 
		lanyon: {
			token:  '', 
			userAPIURL: '',
			orderAPIURL: ''
		}, 
		mailgun: {
			apikey: '', 
			domain: '', 
			to: '', 
			from: ''
		}
	}, 
	test: {
		marketo: {
			clientId: '',
			clientSecret: '', 
			authUrl: '', 
			apiUrl: '', 
			token: '', 
			batchSize: 50
		}, 
		lanyon: {
			token:  '', 
			userAPIURL: '',
			orderAPIURL: ''
		}, 
		mailgun: {
			apikey: '', 
			domain: '', 
			to: '', 
			from: ''
		}
	}, 
	prod: {
		marketo: {
			clientId: '',
			clientSecret: '', 
			authUrl: '', 
			apiUrl: '', 
			token: '', 
			batchSize: 50
		}, 
		lanyon: {
			token:  '', 
			userAPIURL: '',
			orderAPIURL: ''
		}, 
		mailgun: {
			apikey: '', 
			domain: '', 
			to: '', 
			from: ''
		}
	}
}

