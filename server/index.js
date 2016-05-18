// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express')
var ParseServer = require('parse-server').ParseServer
var path = require('path')
var parseConfig = require('./parse-config.js')

console.log(JSON.stringify(parseConfig))
var api = new ParseServer(parseConfig)

var app = express()

// See HTTPS and forwarding proxies
// https://cloud.google.com/appengine/docs/flexible/nodejs/runtime
app.set('trust_proxy', 1);

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')))

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse'
app.use(mountPath, api)

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!')
})

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
// app.get('/test', function(req, res) {
//   res.sendFile(path.join(__dirname, '/public/test.html'))
// })

var port = process.env.PORT || 1337
var httpServer = require('http').createServer(app)
httpServer.listen(port, function() {
    console.log('parse server running on port ' + port + '.')
})

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);
