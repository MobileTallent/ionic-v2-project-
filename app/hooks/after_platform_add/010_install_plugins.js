#!/usr/bin/env node

/**
 * Install all plugins listed in package.json
 * https://raw.githubusercontent.com/diegonetto/generator-ionic/master/templates/hooks/after_platform_add/install_plugins.js
 */
var exec = require('child_process').exec;
var path = require('path');
var sys = require('util');
var fs = require('fs');

var rootDir = process.argv[2];
var packageJSON = null;

try {
  packageJSON = require('../../package.json');
} catch(ex) {
  console.log('\nThere was an error fetching your package.json file.')
  console.log('\nPlease ensure a valid package.json is in the root of this project\n')
  return;
}

var cmd = process.platform === 'win32' ? 'cordova.cmd' : 'cordova';
// var script = path.resolve(__dirname, '../../node_modules/cordova/bin', cmd);

packageJSON.cordovaPlugins = packageJSON.cordovaPlugins || [];
packageJSON.cordovaPlugins.forEach(function (plugin) {
	// Install any plugins we don't have in the /plugins dir. Ignore anything from /plugin-source/
	if(typeof plugin === 'object') {
		if(!plugin.locator) {
			console.error("Could not add plugin " + JSON.stringify(plugin))
			return
		}
		plugin = plugin.locator
	}
	var pluginDir = rootDir + '/plugins/' + plugin
	if(!fs.existsSync(pluginDir) && plugin.indexOf('/plugin-source/') > -1) {

		exec('cordova plugin add ' + plugin, function(error, stdout, stderr) {
			sys.puts(stdout);
		});
	}
});
