#!/usr/bin/env node

/**
 * Push plugins to cordovaPlugins array after_plugin_add
 */
var fs = require('fs');
var packageJSON = require('../../package.json');

packageJSON.cordovaPlugins = packageJSON.cordovaPlugins || [];
process.env.CORDOVA_PLUGINS.split(',').forEach(function (plugin) {

  // we will manually manage any plugins we install locally
  if(plugin.indexOf('/plugin-source/') != -1) {
     console.log("skipping registering plugin located in /plugin-source/ to package.json")
  }
  else if(packageJSON.cordovaPlugins.indexOf(plugin) == -1) {
    packageJSON.cordovaPlugins.push(plugin);
  }
});

fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
