#!/usr/bin/env node

/**
 * The facebookconnect and ParsePush plugins both contain a bolts-android-xx.jar
 * Attempting to build for android with duplicate copies will cause a build failure.
 * The facebook one is required for the project to build, so we will delete the one
 * provided by the parse push plugin which is copied to android/libs/.
 */
var exec = require('child_process').exec;
var path = require('path');
var sys = require('sys');
var fs = require('fs');

var rootDir = process.argv[2];
var androidPlatform = rootDir + '/platforms/android/';

// check for the facebook plugin dir as the bolts jar is under a dynamically generated folder containing the app name
var facebookPlugin = androidPlatform + 'com.phonegap.plugins.facebookconnect/'
// The parse plugin copies it bolts-android jar to the android/libs folder
var parsePushBoltsJar = androidPlatform + 'libs/bolts-tasks-1.4.0.jar'

if( fs.existsSync(facebookPlugin) && fs.existsSync(parsePushBoltsJar)) {
    console.log("--------------------------------------------------------------")
    console.log('Detected facebook plugin and parse push bolts-tasks-1.4.0.jar')
    console.log('Deleting ' + parsePushBoltsJar);
    fs.unlinkSync(parsePushBoltsJar);
    console.log("--------------------------------------------------------------")
}