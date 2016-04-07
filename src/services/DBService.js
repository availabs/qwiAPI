/* code based on example found here: https://github.com/brianc/node-postgres/wiki/Example */


'use strict'

var pg = require('pg')

var conString = "postgres://postgres:1234@localhost/postgres"


function runQuery (query, callback) {

    // get a pg client from the connection pool
    pg.connect(conString, function(err, client, done) {

        var handleError = function(err) {
            // no error occurred, continue with the request
            if(!err) {
                return false
            }

            // An error occurred, remove the client from the connection pool.
            // A truthy value passed to done will remove the connection from the pool
            // instead of simply returning it to be reused.
            // In this case, if we have successfully received a client (truthy)
            // then it will be removed from the pool.
            if(client){
                done(client)
            }

            return true
        }

        // handle an error from the connection
        if(handleError(err)) return callback(err)

        // record the visit
        client.query(query, function(err, result) {

            // handle an error from the query
            if(handleError(err)) { 
                return callback(err)
            }

            // return the client to the connection pool for other requests to reuse
            done()
            
            return callback(null, result)
        })
    })
}


