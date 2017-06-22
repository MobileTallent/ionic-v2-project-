(function() {

    // SQL to model mapping
    // match
    // 		id (Match.id)
    //		last_update (ChatMessage[last].createdAt)
    //		last_message (ChatMessage[last].text
    //		name (Profile.name)
    //		profile_id (Profile.id)
    //		photo (Profile.photo1.url)
    //		read (managed locally)
    //
    // chat_message
    //		id (ChatMessage.id)
    //		chat_id (Match.id)
    //		date (ChatMessage.createdAt)
    //		sender (ChatMessage.sender)
    //		message (ChatMessage.text)
    //		image (ChatMessage.image)

    // See http://www.w3.org/TR/webdatabase/ for the database API
    // And https://github.com/litehelpers/Cordova-sqlite-storage for implementation notes

    angular.module('service.localdb', [])
        .factory('LocalDB', function($q, $log, appName, env) {

            var db

            var service = {
                // fields
                userId: '',
                // methods
                init: init,
                getMatches: getMatches,
                saveMatch: saveMatch,
                deleteMatch: deleteMatch,
                getChatMessages: getChatMessages,
                saveChatMessage: saveChatMessage,
                setChatRead: setChatRead,
                getUnreadChats: getUnreadChats,
                getProfiles: getProfiles,
                saveProfile: saveProfile,
                deleteDb: deleteDb
            }

            return service


            /**
             * At least in Chrome, console.log on a SQLError/SQLException object outputs [Object object] and console.log on
             * JSON.stringify(error) outputs {}. So extract the fields to a plain new object for nice logging
             */
            function convertError(e) {
                return JSON.stringify({ code: e.code, message: e.message })
            }


            function _mapMatchResultSet(sqlResultSet) {
                var len = sqlResultSet.rows.length
                var result = []
                    // id varchar primary key, other_user_id varchar, object match, updated_at integer, read integer
                for (let i = 0; i < len; i++) {
                    let row = sqlResultSet.rows.item(i)
                    var jsonObj = JSON.parse(row.match)
                    jsonObj.className = 'Match'
                        // updated_at can be updated directly by sql when there's a new message, so use this value
                    jsonObj.updatedAt = { __type: 'Date', iso: new Date(row.updated_at).toISOString() }
                    let match = Parse.Object.fromJSON(jsonObj)
                    match.lastMessage = row.last_message
                    match.read = row.read === 1 ? true : false
                    result.push(match)
                }
                return result
            }

            function _mapChatMessageResultSet(sqlResultSet) {
                var len = sqlResultSet.rows.length
                var result = []
                    // (id varchar primary key, chat_id varchar, created_at integer, message text)
                for (let i = 0; i < len; i++) {
                    let row = sqlResultSet.rows.item(i)
                    var json = JSON.parse(row.chat_message)
                    json.className = 'ChatMessage'
                    let chatMessage = Parse.Object.fromJSON(json)
                    result.push(chatMessage)
                }
                return result
            }

            function _mapProfileResultSet(sqlResultSet) {
                var len = sqlResultSet.rows.length
                var result = []
                    // (id varchar primary key, chat_id varchar, created_at integer, message text)
                for (let i = 0; i < len; i++) {
                    let row = sqlResultSet.rows.item(i)
                    var json = JSON.parse(row.profile)
                    json.className = 'Profile'
                    var profile = Parse.Object.fromJSON(json)
                    result.push(profile)
                }
                return result
            }


            // Service functions ----------------------

            function init() {
                var databaseName = appName + '-' + env
                    // Use the native sqlite plugin if it exists
                if (window.sqlitePlugin) {
                    db = window.sqlitePlugin.openDatabase({ name: databaseName + '.db', iosDatabaseLocation: 'default' },
                        () => $log.info('Opened sqlite database ' + databaseName),
                        error => $log.error('Error opening sqlite database ' + JSON.stringify(error)))
                } else {
                    $log.debug('Opening HTML5 database')
                    db = window.openDatabase(databaseName, '', 'LocalDB', 2 * 1024 * 1024)
                }

                const M = new Migrator(db)

                // Set your migrations in the order that they need to occur
                M.migration(1, tx => {
                    // the pattern in the table columns is the id primary key, then the object JSON in a text, then the columns the table might be queried by
                    tx.executeSql('CREATE TABLE profile (id varchar primary key, profile text, user_id varchar)')
                    tx.executeSql('CREATE TABLE match (id varchar primary key, match text, other_user_id varchar, other_profile_id varchar, updated_at integer, last_message varchar, read integer)')
                    tx.executeSql('CREATE TABLE chat_message (id varchar primary key, chat_message text, chat_id varchar, created_at integer)')
                    tx.executeSql('CREATE INDEX chat_message_chat_id ON chat_message (chat_id)')
                })

                // Execute will do all the migrations required for the particular user (e.g., if they're at v1 take them to v2 and then v3)
                return M.execute().then(function() {
                    //now go about executing your SQL or whatever to load the page or site
                    return $q.when()
                })
            }

            /**
             * Deletes data from the database tables
             * @returns {Promise} when the tables have been truncated
             */
            function deleteDb() {
                $log.log('Deleting database data')
                var deferred = $q.defer()
                db.transaction(function(tx) {
                    tx.executeSql('DELETE FROM match')
                    tx.executeSql('DELETE FROM profile')
                    tx.executeSql('DELETE FROM chat_message')
                }, function(e) {
                    $log.error('Error delete database data: ' + e.message)
                    deferred.reject(convertError(e))
                }, function() {
                    $log.log('Database data deleted')
                    deferred.resolve()
                })
                return deferred.promise
            }


            function getMatches() {
                var deferred = $q.defer()
                db.readTransaction(function(tx) {
                    tx.executeSql('SELECT * FROM match ORDER BY updated_at DESC', [], function(tx, sqlResultSet) {
                        deferred.resolve(_mapMatchResultSet(sqlResultSet))
                    })
                }, function(e) {
                    deferred.reject(convertError(e))
                })
                return deferred.promise
            }


            function getProfiles() {
                var deferred = $q.defer()
                db.readTransaction(function(tx) {
                    tx.executeSql('SELECT * FROM profile', [], function(tx, sqlResultSet) {
                        deferred.resolve(_mapProfileResultSet(sqlResultSet))
                    })
                }, function(e) {
                    deferred.reject(convertError(e))
                })
                return deferred.promise
            }

            //function getProfile(profileId) {
            //	var deferred = $q.defer()
            //	db.readTransaction(function(tx) {
            //			tx.executeSql('SELECT * FROM profile where id=?', [profileId], function(tx, sqlResultSet) {
            //				deferred.resolve(_mapProfileResultSet(sqlResultSet))
            //			})
            //		}, function(e) {
            //			deferred.reject(convertError(e))
            //		}
            //	)
            //	return deferred.promise
            //}


            function saveMatch(match, profile) {
                var deferred = $q.defer()
                    // Store the profile id as otherProfile on the match so the profile property works when we deserialise
                    // Make a copy so we can remove the profile data which is saved in a different table
                match.profile = profile
                var matchJson = match.toJSON()
                matchJson.otherProfileId = profile.id
                delete matchJson.otherProfile // no need to waste space storing this here as we save it in the profile table. this does break the method Match.profile (cant get id of undefined if you try and call it)

                db.transaction(function(tx) {
                    // (id varchar primary key, match text, other_user_id varchar, other_profile_id varchar, updated_at integer, read integer)'
                    tx.executeSql('INSERT OR REPLACE INTO match (id, match, other_user_id, other_profile_id, updated_at, last_message, read) ' +
                        'VALUES (?,?,?,?,?,?,?)', [match.id, JSON.stringify(matchJson), profile.uid, profile.id, match.updatedAt.getTime(), match.lastMessage, 0])

                    // (id varchar primary key, profile text, user_id varchar)
                    tx.executeSql('INSERT OR REPLACE INTO profile (id, profile, user_id) ' +
                        'VALUES (?,?,?)', [profile.id, JSON.stringify(profile.toJSON()), profile.uid])

                }, function(e) {
                    deferred.reject(convertError(e))
                    $log.error('Error saving match: ' + e.message)
                }, function() {
                    deferred.resolve()
                })
                return deferred.promise
            }


            function saveProfile(profile) {
                var deferred = $q.defer()

                db.transaction(function(tx) {
                    // console.log(`Saving profile ${profile.distance}` )
                    // (id varchar primary key, profile text, user_id varchar)
                    tx.executeSql('INSERT OR REPLACE INTO profile (id, profile, user_id) ' +
                        'VALUES (?,?,?)', [profile.id, JSON.stringify(profile), profile.uid])
                }, function(e) {
                    deferred.reject(convertError(e))
                    $log.error('Error saving profile: ' + e.message)
                }, function() {
                    deferred.resolve()
                })
                return deferred.promise
            }


            function deleteMatch(matchId) {
                var deferred = $q.defer()
                db.transaction(function(tx) {
                    tx.executeSql('DELETE FROM match WHERE id=?', [matchId])
                    tx.executeSql('DELETE FROM chat_message WHERE chat_id=?', [matchId])
                }, function(e) {
                    deferred.reject(convertError(e))
                    $log.error('LocalDB Error deleting match: ' + e.message)
                }, function() {
                    deferred.resolve()
                })
                return deferred.promise
            }


            function getChatMessages(chatId) {
                var deferred = $q.defer()
                db.readTransaction(function(tx) {
                    tx.executeSql('SELECT * FROM chat_message WHERE chat_id = ? ORDER BY created_at ASC', [chatId], function(tx, sqlResultSet) {
                        deferred.resolve(_mapChatMessageResultSet(sqlResultSet))
                    })
                }, function(e) {
                    deferred.reject(convertError(e))
                })
                return deferred.promise
            }

            /**
             * Save a chat message (if it doesn't already exist)
             * @param msg the chat message
             * @returns {Promise<boolean>} A promise which resolves to if this was inserted or false if already in the database
             */
            function saveChatMessage(msg) {
                var deferred = $q.defer()
                var isNew = false
                var msgJson = msg.toJSON()

                db.transaction(function(tx) {
                    // (id varchar primary key, chat_message text, chat_id varchar, created_at integer)
                    tx.executeSql('INSERT OR IGNORE INTO chat_message ' +
                        '(id, chat_message, chat_id, created_at) ' +
                        'VALUES (?,?,?,?)', [msg.id, JSON.stringify(msgJson), msg.match.id, msg.createdAt.getTime()],
                        function(tx, sqlResultSet) {
                            isNew = sqlResultSet.rowsAffected > 0
                        })

                    // If the message is newer then update the match updated_at
                    tx.executeSql('UPDATE match SET updated_at = ?, last_message = ? WHERE id = ? and ? > updated_at', [msg.createdAt.getTime(), msg.lastMessage, msg.match.id, msg.createdAt.getTime()])

                    if (service.userId !== msg.sender && isNew) {
                        // update the read flag to unread if the message doesn't exist in the local db
                        tx.executeSql('UPDATE match SET read = 0 WHERE EXISTS (SELECT 1 FROM chat_message WHERE id = ?)', [msg.id])
                    } else if (service.userId !== msg.sender && !isNew) {
                        // update the read flag to unread if the message doesn't exist in the local db
                        tx.executeSql('UPDATE match SET read = 0 WHERE NOT EXISTS (SELECT 1 FROM chat_message WHERE id = ?)', [msg.id])
                    }

                }, function(e) {
                    deferred.reject(convertError(e))
                    $log.error('Error saving chat message: ' + e.message)
                }, function() {
                    deferred.resolve(isNew)
                })
                return deferred.promise
            }

            /**
             * Marks a match/chat as read
             * @param chatId
             * @param {boolean} read the read flag
             * @returns {Promise} A promise which resolves when the database transaction has completed
             */
            function setChatRead(chatId, read) {
                if (!_.isBoolean(read)) {
                    throw 'read must be a boolean. Was ' + read
                }

                // sqlite does not have a boolean value, use 0/1
                var readValue = read ? 1 : 0

                var deferred = $q.defer()
                db.transaction(function(tx) {
                    tx.executeSql('UPDATE match SET read = ? WHERE id = ?', [readValue, chatId])
                }, function(e) {
                    deferred.reject(convertError(e))
                    $log.error('Error updating read flag: ' + e.message)
                }, function() {
                    deferred.resolve()
                })
                return deferred.promise
            }

            /**
             * @returns {object} an object with the keys as the match id's which are unread
             */
            function getUnreadChats() {
                var deferred = $q.defer()
                db.readTransaction(function(tx) {
                    tx.executeSql('SELECT * FROM match WHERE read = 0', [], function(tx, sqlResultSet) {
                        var len = sqlResultSet.rows.length
                        var unreadChats = {}
                        for (let i = 0; i < len; i++) {
                            let row = sqlResultSet.rows.item(i)
                            unreadChats[row.id] = true
                        }
                        deferred.resolve(unreadChats)
                    })
                }, function(e) {
                    deferred.reject(convertError(e))
                })
                return deferred.promise
            }


            function Migrator(db) {
                // Pending migrations to run
                var migrations = []

                var state = 0

                var MIGRATOR_TABLE = 'version'

                // Use this method to actually add a migration.
                // You'll probably want to start with 1 for the migration number.
                this.migration = function(number, func) {
                    migrations[number] = func
                }

                // Execute a given migration by index
                function doMigration(number) {
                    const deferred = $q.defer()
                    if (migrations[number]) {
                        db.transaction(t => {
                            t.executeSql('update ' + MIGRATOR_TABLE + ' set version = ?', [number],
                                t => {
                                    $log.info('Beginning migration ' + number)
                                    migrations[number](t)
                                    $log.info('Completed migration ' + number)
                                    doMigration(number + 1)
                                        .then(() => deferred.resolve())
                                }, (t, err) => {
                                    $log.error('Error!: %o (while upgrading to %s from %s)', err.message, number)
                                    deferred.reject(convertError(e))
                                })
                        })
                    } else {
                        $log.debug('Migrations complete.')
                        state = 2
                        deferred.resolve()
                    }

                    return deferred.promise
                }

                // helper that actually calls doMigration from doIt.
                function migrateStartingWith(ver) {
                    state = 1
                    $log.debug('Main Migrator starting')
                        //return doMigration(ver + 1)
                    const deferred = $q.defer()

                    try {
                        return doMigration(ver + 1).then(() => deferred.resolve())
                    } catch (e) {
                        deferred.reject(e)
                    }

                    return deferred.promise
                }


                function ensureMigrationTable() {
                    const deferred = $q.defer()
                    $log.log('Ensuring migration table exists')
                    db.transaction(t => {
                        t.executeSql('create table if not exists ' + MIGRATOR_TABLE + ' (version integer)', [],
                            (tx, sqlResultSet) => deferred.resolve(),
                            (t, err) => deferred.reject('Error creating version table' + convertError(e))
                        )
                    })
                    return deferred.promise
                }

                function getCurrentVersion() {
                    const deferred = $q.defer()
                    $log.log('Checking for existing migration version')
                    db.transaction(t => {
                        t.executeSql('SELECT VERSION FROM ' + MIGRATOR_TABLE, [],
                            (tx, sqlResultSet) => {

                                if (sqlResultSet.rows.length > 0)
                                    return deferred.resolve(sqlResultSet.rows.item(0).version)

                                $log.log('Inserting default migration version')
                                t.executeSql('INSERT INTO ' + MIGRATOR_TABLE + ' values(0)', [],
                                    (tx, sqlResultSet) => {
                                        deferred.resolve(0)
                                    },
                                    (t, error) => deferred.reject('Error ensuring default version ' + convertError(error))
                                )
                            },
                            (t, error) => deferred.reject('Error selecting version ' + convertError(error))
                        )
                    })
                    return deferred.promise
                }


                this.execute = function() {
                    if (state > 0)
                        throw 'Migrator is only valid once -- create a new one if you want to do another migration.'

                    return ensureMigrationTable()
                        .then(() => getCurrentVersion())
                        .then(version => migrateStartingWith(version))
                        .catch(error => $log.error('SQL DB init error:', error))
                }

            }

        })

})(); // end IIFE