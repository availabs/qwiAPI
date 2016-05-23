'use strict'

const pg = require('pg')



 //postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
const conString = (() => {
    let user   = process.env.QWI_POSTGRES_USER
    let passwd = process.env.QWI_POSTGRES_PASSWORD || ''
    let netloc = process.env.QWI_POSTGRES_NETLOC
    let port   = process.env.QWI_POSTGRES_PORT     || ''
    let dbname = process.env.QWI_POSTGRES_DB

    return 'postgresql://' + user + (passwd && (':' + passwd)) +'@'+ netloc + (port && (':' + port)) +'/'+ dbname
})()


const handleParsedQueryObject = (parsedQueryObject, cb) => {
  runQuery(parsedQueryObject.sqlStatement, (err, result) => {
    if (err) {
      return cb(err)
    }

    parsedQueryObject.result = result

    return cb(null, parsedQueryObject)
  }) 
}


 //code based on example found here: https://github.com/brianc/node-postgres/wiki/Example 
function runQuery (query, callback) {

  // get a pg client from the connection pool
  return pg.connect(conString, function(err, client, done) {

      var handleError = function(err) {
          if(!err) { return false }

          if(client){ done(client) }

          return true
      }

      // handle an error from the connection
      if(handleError(err)) { return callback(err) }

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


// Used in the database initialization scripts.
const end = () => {
  pg.end()
}


module.exports = {
  handleParsedQueryObject : handleParsedQueryObject,
  runQuery                : runQuery,
  end                     : end,
}
