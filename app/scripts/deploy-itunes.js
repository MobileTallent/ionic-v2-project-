#!/usr/bin/env node

var shell = require('shelljs')
var xml2js = require('xml2js')
var fs = require('fs')

var parser = new xml2js.Parser();
var config = parser

fs.readFile(__dirname + '/config.xml', function(err, data) {

    if(err) {
        console.log('Error reading config.xml')
        console.log(err)
        process.exit(1)
    }

    parser.parseString(data, function (err, result) {

        if(err) {
            console.log('Error parsing config.xml')
            console.log(err)
            process.exit(1)
        }

        if(!result.widget.name) {
            console.log('Configure the name in config.xml')
            process.exit(1)
        }

        var filename = `platforms/ios/build/device/${result.widget.name}.ipa`
        if(!fs.existsSync(filename)) {
            console.log(filename + ' doesnt exist. Have you done a build for a device?')
            console.log('Note that the ionic build --device --release command can take a few runs to actually build the .ipa file')
            console.log('You should see the last line of the console output')
            process.exit(1)
        }

        var command = `deliver --ipa \"platforms/ios/build/device/${result.widget.name}.ipa\" --submit_for_review`
        console.log('exec: ' + command)
        shell.exec(command)
    })
})
