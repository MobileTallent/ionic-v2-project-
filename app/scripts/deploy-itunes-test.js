#!/usr/bin/env node

var xml2js = require('xml2js')
var fs = require('fs')

var config = require('../../server/config.json')

var parser = new xml2js.Parser()

fs.readFile(__dirname + '/../config.xml', function(err, data) {

    if(err) {
        console.log('Error reading app/config.xml')
        console.log(err)
        process.exit(1)
    }

    parser.parseString(data, function (err, result) {

        if(err) {
            console.log('Error parsing app/config.xml')
            console.log(err)
            process.exit(1)
        }

        if(!result.widget.name) {
            console.log('Configure the name attribute in app/config.xml')
            process.exit(1)
        }

        var filename = `platforms/ios/build/device/${result.widget.name}.ipa`
        if(!fs.existsSync(filename)) {
            console.log(filename + ' doesnt exist. Have you done a build for a device?')
            console.log('Note that the ionic build --device --release command can take a few runs to actually build the .ipa file')
            console.log('You should see the last line of the console output of ionic build as ** EXPORT SUCCEEDED **')
            process.exit(1)
        }

        var itunesConnect = config.itunesConnect

        var pilotArgs = [ "pilot", "upload", "--ipa", `platforms/ios/build/device/${result.widget.name}.ipa`, "--distribute_external",
            "--skip_waiting_for_build_processing"]

        var options = { stdio: "inherit", stdin: "inherit", env: process.env }

        if(itunesConnect) {
            if(itunesConnect.email)
                pilotArgs.push("--username", itunesConnect.email)
            else
                console.log('Populate the itunesConnect.email value in server/config.json to automate the username entry')

            if(itunesConnect.teamId)
                options.env.FASTLANE_ITC_TEAM_ID = itunesConnect.teamId
            else
                console.log('Populate the itunesConnect.teamId value in server/config.json to automate the team selection')
        }

        // console.log("fastlane " + JSON.stringify(pilotArgs))
        var result = require("child_process")
            .spawnSync( "fastlane", pilotArgs, options )
        // console.log(result.stdout)
        // console.log(result.stderr)
        // console.log(result.error)


    })
})
