#!/usr/bin/env node
// Script to deploy to Google App Engine
var shell = require('shelljs')
var fs = require('fs')

var config = require('../../server/config.json');

if(!config.prod.gcpProjectNumber) {
    console.log('Error installing the Parse Push plugin')
    console.log('prod.gcpProjectNumber has not been set in /server/config.json')
    console.log('Follow the installation documentation to set prod.gcpProjectNumber with your Google Cloud project number')
    process.exit(1)
}

var command = 'ionic plugin add https://github.com/taivo/parse-push-plugin#a2e696aa27dcc0df7c7a4669caa3d0c0a5ffdaf2 --save --variable GCM_SENDER_ID="' + config.prod.gcpProjectNumber + '"'
console.log('exec ' + command)
var child = shell.exec(command);
