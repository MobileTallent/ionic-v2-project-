#!/usr/bin/env node

// Custom hook to fix the conflict between the AdMob plugin and the Facebook plugin and Parse plugin
// http://stackoverflow.com/questions/32099385/error-multiple-dex-files-define-landroid-support-annotations-animres-with-admob
// https://github.com/BoltsFramework/Bolts-Android/issues/80

var fs = require('fs')
var path = require('path')

var rootDir = process.argv[2]

var androidPlatformDir = rootDir + '/platforms/android/'
var buildExtrasGradle = androidPlatformDir + 'build-extras.gradle'
/*
if(fs.existsSync(androidPlatformDir) && !fs.existsSync(buildExtrasGradle)) {
	console.log('Creating ' + buildExtrasGradle)
	var fileContents = "configurations { all*.exclude group: 'com.android.support', module: 'support-v4' }\n"
					+ "configurations { all*.exclude group: 'com.parse.bolts', module: 'bolts-android' }"

	fs.writeFileSync(buildExtrasGradle, fileContents, 'utf8')
	console.log('Created ' + buildExtrasGradle)
}*/