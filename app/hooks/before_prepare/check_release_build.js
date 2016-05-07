#!/usr/bin/env node

/**
 * This hook runs on release builds (i.e. when running ionic build android --release)
 * It checks gulp has last been run with the --env prod flag so the production config
 * is used for the release build
 */
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
		throw 'Release build check failed'
	}
}
