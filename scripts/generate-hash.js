#!/usr/bin/env node
var shell = require('shelljs')
var fs = require('fs')

console.log('Note: You must have <JAVA>/bin and <OPENSSL>/bin on your PATH for this to work')

var buildJson = require('../build.json');

if(!buildJson.android.release.alias) {
    console.log('Error: You must configure android.release.alias in app/build.json')
    process.exit(1)
}

if(!buildJson.android.release.keystore) {
    console.log('Error: You must configure android.release.keystore in app/build.json')
    process.exit(1)
}
var command = 'keytool -exportcert -alias '+ buildJson.android.release.alias +' -keystore ' + buildJson.android.release.keystore + ' | openssl sha1 -binary | openssl base64'
console.log('exec: ' + command)
var child = shell.exec(command)
