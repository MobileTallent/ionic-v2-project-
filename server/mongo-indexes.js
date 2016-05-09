if(typeof dbName === 'undefined')
	throw "Argument required: --env 'var dbName=\"<DBNAME>\"'"
var mydb = db.getSiblingDB(dbName)

// mydb._User.createIndex( { "createdAt": 1}, {background: true} )

mydb.Profile.createIndex( { "createdAt": 1}, {background: true} )
mydb.Profile.createIndex( { location : "2dsphere", updatedAt:-1 }, {background: true} )
mydb.Profile.createIndex( { "uid": 1}, {background: true} )

mydb.Match.createIndex( { "uid1": 1}, {background: true} )
mydb.Match.createIndex( { "uid2": 1}, {background: true} )
mydb.Match.createIndex( { "uid1": 1, "uid2": 1 }, { background: true, unique: true } )

