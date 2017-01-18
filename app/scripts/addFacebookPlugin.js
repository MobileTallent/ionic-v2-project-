#!/usr/bin/env node
var shell = require('shelljs')
var fs = require('fs')

var config = require('../../server/config.json');

if(!config.facebookAppId) {
    console.log('Error installing the Facebook plugin')
    console.log('facebookAppId has not been set in /server/config.json')
    process.exit(1)
}
if(isNaN(config.facebookAppId)) {
    console.log('Error installing the Facebook plugin')
    console.log('facebookAppId in /server/config.json is not a number')
    process.exit(1)
}

if(!config.facebookAppName) {
    console.log('Error installing the Facebook plugin')
    console.log('facebookAppId has not been set in /server/config.json')
    process.exit(1)
}

var command = 'cordova plugin add cordova-plugin-facebook4@1.7.4 --variable APP_ID="' + config.facebookAppId + '" --variable APP_NAME="' + config.facebookAppName + '"'
console.log('exec: ' + command)
var child = shell.exec(command)
