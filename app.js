"use strict"


const envFile = require('node-env-file')
envFile(__dirname + '/config/node_server.env')
envFile(__dirname + '/config/postgres_db.env')
envFile(__dirname + '/config/qwi.env')

const env = require('process').env

const app = require('express')()
const bodyParser = require('body-parser')

const async = require('async')



const validateRequestedCategories = require('./src/services/CategoryValidationService').validateRequestedCategories
const validateRequestedIndicators = require('./src/services/MeasureValidationService').validateRequestedIndicators
const buildSQLString = require('./src/builders/SQLStringBuilder').buildSQLString
const runQuery = require('./src/services/DBService').runQuery
const getUploadedStates = require('./src/services/DBService').getUploadedStates
const getTableName = require('./src/services/TableService').getTableName
const nestedResponseObjectBuilder = require('./src/builders/nestedResponseObjectBuilder')

const port = (env.PORT || 10101)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())



app.get('/metadata/uploaded/states', (req, res) => {
     getUploadedStates((err, result) => {
        if (err) {
            return res.status(500).send(err)
        } else {
            return res.status(200).send({ data: result })
        }
    })
})



app.get('/data/*', (req, res) => {

    let url = req.url.replace('/data/', '')

    let requestedCategories = url.toLowerCase()    // For case insensitive queries
                                 .split('?')[0]    // The URL before the query params
                                 .split('/')       // Split on the '/' character
                                 .filter(s => s)   // Get rid of empty strings

    let requestedCategoryNames = requestedCategories.map(s => s.replace(/[0-9]/g, '')) // Remove digits

    let query = req.query

//console.log('\n----- FIELDS -----')
//console.log(query)

    let requestedIndicators = query.fields

    let validators = [ validateRequestedCategories.bind(null, requestedCategoryNames),
                       validateRequestedIndicators.bind(null, requestedIndicators) ]


    async.parallel(validators, (err) => {
    
      if (err) {
          console.error(err.stack)
          return res.status(400).json({ error: err.message })
      }

      let tableName = getTableName(requestedCategoryNames) 

      let sqlString = buildSQLString(tableName, requestedCategories, requestedIndicators)

      runQuery(sqlString, (err, result) => {
          if (err) {
            console.error(err.stack)
            return res.status(500).send(err)
          } else {
//console.log('===== RESULT =====')
//console.log(JSON.stringify(result, null, 4))
//console.log('===== RESULT DONE=====')
            let hierarchicalResult = nestedResponseObjectBuilder.build(result.rows, requestedCategoryNames)
            //return res.status(200).send({ data: result.rows })
            return res.status(200).send({ data: hierarchicalResult })
          }
      })
    })
})


app.listen(port, function () {
    console.log('App listening on port ' + port)
})
