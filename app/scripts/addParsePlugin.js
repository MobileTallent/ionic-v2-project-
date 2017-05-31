#!/usr/bin/env node
var shell = require('shelljs')
var fs = require('fs')

var config = require('../../server/config.json');

if(!config.prod.gcpProjectNumber) {
    console.log('Error installing the Parse Push plugin')
    console.log('prod.gcpProjectNumber has not been set in /server/config.json')
    console.log('Follow the installation documentation to set prod.gcpProjectNumber with your Google Cloud project number')
    process.exit(1)
}

var command = 'cordova plugin add https://github.com/taivo/parse-push-plugin#55b92cf416dec3dd973ba58559e0d74f7409471f'
console.log('exec: ' + command)
var child = shell.exec(command);
