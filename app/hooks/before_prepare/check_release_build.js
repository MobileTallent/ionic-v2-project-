#!/usr/bin/env node

/**
 * This hook runs on release builds (i.e. when running ionic build android --release)
 * It checks gulp has last been run with the --env prod flag so the production config
 * is used for the release build
 */
var gplay = require('google-play-scraper')
var parseString = require('xml2js').parseString
var fs = require('fs')
var cliCommand   = process.env.CORDOVA_CMDLINE
var isReleaseBuild = cliCommand.indexOf('--release') > -1

var PROD_STRING_REGEX = /constant\("buildEnv",\s?"prod"\)/

var rootDir = process.argv[2]
var appJs

if (isReleaseBuild) {
	appJs = fs.readFileSync(rootDir + '/www/app.js', 'utf8')

	if(!PROD_STRING_REGEX.test(appJs)) {
		console.log('')
		console.log('===========================================================')
		console.log(' Could not find constant("buildEnv", "prod") in app.js')
		console.log(' Attempted to do a release build without prod config. Run:')
		console.log(' gulp --env prod')
		console.log('===========================================================')
		process.exit(1)
	}
}

// Check if the version in the config.xml is the same as on the Play store.
// If so then the config.xml version needs to be updated

var configXml = fs.readFileSync('config.xml', 'utf8')

parseString(configXml, function (err, config) {
	var configVersion = config.widget.$.version
	var appId = config.widget.$.id
	console.log('appId', appId)
	console.log('version', configVersion)

	gplay.app({appId: appId})
		.then(function(app){
			if(configVersion === app.version) {
				console.log('=============================================================')
				console.log(' The version attribute in config.xml needs to be incremented')
				console.log(' Version ' + configVersion + ' is already on the Play store')
				console.log('=============================================================')
				process.exit(1)
			}
		})
		.catch(function(e){
			console.log('There was an error fetching the application version from the Play store', e)
		})
})