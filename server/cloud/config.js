
var jsonfile = require('jsonfile')
var config = jsonfile.readFileSync('config.json')
// console.log(JSON.stringify(config))
module.exports = config
