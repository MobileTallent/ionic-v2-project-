#!/usr/bin/env node
// Script to run the Parse dashboard
var shell = require('shelljs')
var fs = require('fs')

var config = require('../config.json');

// Get the --env arg
var env = require('commander')
    .option('-e, --env <environment>', 'The environment to deploy to')
    .parse(process.argv).env
if(!env) env = 'dev'

// The the env config exists in config.json
if(!config[env]) {
    console.log('Configuration for the ' + env + ' environment does not exist in config.json')
    process.exit(1)
}

if(!config.parseMount) {
    console.log('parseMount is not configured in config.json')
    process.exit(1)
}

if(!config.parseAppId) {
    console.log('parseAppId is not configured in config.json')
    process.exit(1)
}

if(!config.parseMasterKey) {
    console.log('parseAppId is not configured in config.json')
    process.exit(1)
}

if(!config[env].serverUrl) {
    console.log('serverUrl is not configured in config.json for the environment ' + env)
    process.exit(1)
}

var command = `parse-dashboard --serverURL \"${config.prod.serverUrl}${config.parseMount}\" --appId ${config.json.parseAppId} --masterKey ${config.parseMasterKey}`
console.log('exec: ' + command)
var child = shell.exec(command);
