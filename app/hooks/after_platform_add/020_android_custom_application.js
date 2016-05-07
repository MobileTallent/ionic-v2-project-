#!/usr/bin/env node

// Hook to log a warning/instruction after installing the android platform

var fs = require('fs');
var path = require('path');

var rootDir = process.argv[2];

var applicationClassName = 'org.apache.cordova.CustomApplication';
var applicationClassFileName = rootDir + '/platforms/android/src/org/apache/cordova/CustomApplication.java';
var androidManifestXmlPath = rootDir + '/platforms/android/AndroidManifest.xml'


if(fs.existsSync(androidManifestXmlPath)) {

	if(!fs.existsSync(applicationClassFileName)) {
		var msg = '!!----------------------------------------------------------------------!!\n' +
			'!!  Run/restart gulp to configure the custom Android application class  !!\n' +
			'!!----------------------------------------------------------------------!!\n';
		process.stdout.write(msg)
	}
}