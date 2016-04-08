/* code based on example found here: https://github.com/brianc/node-postgres/wiki/Example */


'use strict'

const pg = require('pg')

// postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
const conString = (() => {
    const process = require('process')

    let user   = process.env.POSTGRES_USER || 'postgres'
    let passwd = process.env.POSTGRES_PASSWORD || ''
    let netloc = process.env.POSTGRES_NETLOC || 'localhost'
    let port   = process.env.POSTGRES_PORT || ''
    let dbname = process.env.POSTGRES_DB || 'qwiAPI'

    return 'postgresql://' + user + (passwd && (':' + passwd)) +'@'+ netloc + (port && (':' + port)) +'/'+ dbname
})()


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

module.exports = {
    runQuery : runQuery
}
