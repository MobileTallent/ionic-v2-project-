#!/usr/bin/env node

// Custom hook to fix the conflict between the AdMob plugin and the Facebook plugin and Parse plugin
// http://stackoverflow.com/questions/32099385/error-multiple-dex-files-define-landroid-support-annotations-animres-with-admob
// https://github.com/BoltsFramework/Bolts-Android/issues/80
// http://stackoverflow.com/questions/28791817/android-studio-gradle-error-multiple-dex-files-define

// http://stackoverflow.com/questions/31727318/cordova-multiple-dex-files-define-annotation

var fs = require('fs')
var path = require('path')

var rootDir = process.argv[2]

var androidPlatformDir = rootDir + '/platforms/android/'
var buildExtrasGradle = androidPlatformDir + 'build-extras.gradle'

if(fs.existsSync(androidPlatformDir)) {

	var fileContents = "// This file is written from /app/hooks/before_prepare/030_add_build-extras.js\n"
		+ "configurations { all*.exclude group: 'com.android.support', module: 'support-v4' }\n"
		+ "configurations { all*.exclude group: 'com.parse.bolts', module: 'bolts-android' }\n"
		+ "configurations { all*.exclude group: 'com.parse.bolts', module: 'bolts-tasks' }\n"
		//+ "dependencies { compile 'com.parse.bolts:bolts-applinks:1.4.0' }\n"

		+ "dependencies { compile ('com.facebook.android:facebook-android-sdk:4.8.+'){ exclude group: 'com.parse.bolts', module: 'bolts-tasks' exclude group: 'com.parse.bolts', module: 'bolts-applinks';} }\n"

	//	+ "dependencies {compile 'com.parse.bolts:bolts-tasks:1.4.0'}\n"
		+ "dependencies {compile 'com.parse.bolts:bolts-applinks:1.4.0'}\n"
	
	console.log('Updating ' + buildExtrasGradle)
	console.log(fileContents)

	fs.writeFileSync(buildExtrasGradle, fileContents, 'utf8')
}