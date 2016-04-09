"use strict"


const env = require('node-env-file')
env(__dirname + '/config/node_server.env')
env(__dirname + '/config/postgres_db.env')
env(__dirname + '/config/qwi.env')


const app = require('express')()
const bodyParser = require('body-parser')
const _ = require('lodash')


const validateRequestedCategories = require('./src/services/CategoryValidationService').validateRequestedCategories
const validateRequestedMeasures = require('./src/services/MeasureValidationService').validateRequestedMeasures
const buildSQLString = require('./src/builders/SQLStringBuilder').buildSQLString
const createTables = require('./src/services/DBService.js').createTables
const loadLabels = require('./src/services/DBService.js').loadLabels
const loadStatesData = require('./src/services/DBService.js').loadStatesData
const runQuery = require('./src/services/DBService').runQuery
const getTableName = require('./src/services/TableService').getTableName


const port = (require('process').env.PORT || 10101)


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// Create the data and label tables
app.post('/admin/database/tables/create', (req, res) => {
    return createTables((err, result) => {
        if (err) {
            console.log(err.stack)
            return res.status(500).send({ error: err })
        } else {
            return res.status(200).send({ message: result })
        }
    })
})


app.post('/admin/database/tables/load/labels', (req, res) => {
    return loadLabels((err, result) => {
        if (err) {
            console.log(err.stack)
            return res.status(500).send({ error: err })
        } else {
            return res.status(200).send({ message: result })
        }
    })
})


app.post('/admin/database/tables/load/states', (req, res) => {
    
    let states = req.body.states

    return loadStatesData(states, (err, result) => {
        if (err) {
            console.log(err.stack)
            return res.status(500).send({ error: err })
        } else {
            return res.status(200).send({ message: result })
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

    let requestedMeasures = query.fields

    let validationErrorMessages = ''

    
    try {
        validateRequestedCategories(requestedCategoryNames)
    } catch (err) {
        validationErrorMessages += (err.message + '\n')
        console.error(err.stack)
    }

    try {
        validateRequestedMeasures(requestedMeasures)
    } catch (err) {
        validationErrorMessages += (err.message + '\n')
        console.error(err.stack)
    }

    if (validationErrorMessages) {
        return res.status(400).json({ error: validationErrorMessages })
    }


    let tableName = getTableName(requestedCategoryNames) 

    let sqlString = buildSQLString(tableName, requestedCategories, requestedMeasures)

    runQuery(sqlString, (err, result) => {
        if (err) {
            return res.status(500).send(err)
        } else {
            return res.status(200).send(result)
        }
    })
})


app.listen(port, function () {
    console.log('App listening on port ' + port)
})
