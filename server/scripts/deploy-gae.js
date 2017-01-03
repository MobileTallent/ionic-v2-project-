#!/usr/bin/env node
// Script to deploy to Google App Engine
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

// Copy the .yaml file
var envYaml = 'app-' + env + '.yaml'

if(!fs.existsSync(envYaml)) {
    console.log('The file ' + envYaml + ' does not exist to deploy to the environment ' + env)
    process.exit(1)
}

shell.cp(envYaml, 'app.yaml')

if(!config[env].gcpProjectId) {
    console.log('gcpProjectId is not configured in config.json for the environment ' + env)
    process.exit(1)
}

// Deploy!
if (os.platform() === 'win32') {
    shell.exec('gcloud app deploy --quiet --stop-previous-version --project ' + config[env].gcpProjectId)
} else {
    require("child_process")
        .spawnSync( "gcloud", [ "app", "deploy", "--quiet", "--stop-previous-version", "--project", config[env].gcpProjectId],
            { stdio: "inherit", stdin: "inherit" } )
}
