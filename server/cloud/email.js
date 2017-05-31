/**
 * Module for sending email which uses the Mailgun implementation
 */
var config = require('../config.js')
console.log('Mailgun configuration: ' + JSON.stringify(config.mailgun))

var configured = config.mailgun.domain && config.mailgun.key && config.mailgun.from

var mailgun

if(configured)
	mailgun = require('mailgun.js').client({username: 'api', key: process.env.MAILGUN_API_KEY || config.mailgun.key});
else
	console.log('Email sending is not configured')

var exports = module.exports = {}


exports.sendEmail = function (to, subject, text) {
	if(!configured) {
		console.log('Email sending is not configured - could not send email')
		return Parse.Promise.as()
	}

	return mailgun.messages.create(config.mailgun.domain, {
		from: config.mailgun.from,
		to: [to],
		subject: subject,
		text: text,
		html: text
	})
}


exports.sendAdminEmail = function(subject, text) {
	if(!configured) {
		console.log('Email sending is not configured - could not send email')
		return Parse.Promise.as()
	}

	return mailgun.messages.create(config.mailgun.domain, {
		from: config.mailgun.from,
		to: [config.mailgun.from],
		subject: subject,
		text: text,
		html: text
	})
}
