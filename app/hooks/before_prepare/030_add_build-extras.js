#!/usr/bin/env node

// Custom hook to fix the conflict between the AdMob plugin and the Facebook plugin
// http://stackoverflow.com/questions/32099385/error-multiple-dex-files-define-landroid-support-annotations-animres-with-admob

var fs = require('fs');
var path = require('path');

var rootDir = process.argv[2];

var androidPlatformDir = rootDir + '/platforms/android/'
var buildExtrasGradle = androidPlatformDir + 'build-extras.gradle'

if(fs.existsSync(androidPlatformDir) && !fs.existsSync(buildExtrasGradle)) {
	var fileContents = "configurations { all*.exclude group: 'com.android.support', module: 'support-v4' }"
	fs.writeFileSync(buildExtrasGradle, fileContents, 'utf8')
	console.log('Created ' + buildExtrasGradle)
}