#!/usr/bin/env node

var exec = require('child_process').exec;
var path = require('path');
var sys = require('sys');
var fs = require('fs');

// we need to delete the facebook plugin so it will install with the APP_ID and APP_NAME variables
var rootDir = process.argv[2];

var deleteFolderRecursive = function(removePath) {
    if( fs.existsSync(removePath) ) {
        fs.readdirSync(removePath).forEach(function(file,index){
            var curPath = path.join(removePath, file);
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(removePath);
    }
};


var fbPluginPath = rootDir + '/plugins/com.phonegap.plugins.facebookconnect';

if( fs.existsSync(fbPluginPath) ) {
    console.log('Deleting facebook plugin')
    deleteFolderRecursive(fbPluginPath);
}