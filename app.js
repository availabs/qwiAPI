"use strict"


const envFile = require('node-env-file')
envFile(__dirname + '/config/node_server.env')
envFile(__dirname + '/config/postgres_db.env')
envFile(__dirname + '/config/qwi.env')


const env = require('process').env


const app = require('express')()
const bodyParser = require('body-parser')
const _ = require('lodash')


const validateRequestedCategories = require('./src/services/CategoryValidationService').validateRequestedCategories
const validateRequestedMeasures = require('./src/services/MeasureValidationService').validateRequestedMeasures
const buildSQLString = require('./src/builders/SQLStringBuilder').buildSQLString
const createTables = require('./src/services/DBService.js').createTables
const loadLabels = require('./src/services/DBService.js').loadLabels
const loadStatesData = require('./src/services/DBService.js').loadStatesData
const loadAllStates = require('./src/services/DBService.js').loadAllStates
const runQuery = require('./src/services/DBService').runQuery
const getUploadedStates = require('./src/services/DBService').getUploadedStates
const getTableName = require('./src/services/TableService').getTableName


const port = (env.PORT || 10101)
const adminPasswd = env.QWI_API_SERVER_ADMIN_PASSWORD

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


let DDL_lock = null

// Create the data and label tables
app.post('/admin/database/tables/create', (req, res) => {
   
    if (adminPasswd && (adminPasswd !== (req.body.password || req.query.password))) {
        return res.status(403).send({ error: 'admin/* routes require a vaild password in the body or query params.' })
    }

    if (DDL_lock) {
        return res.status(503).send({ 
            error: 'Only one DDL operation request allowed at a time.\n' + 
                   'Lock currently held by ' + DDL_lock.message
        })
    } else {
        DDL_lock = { message: '/admin/database/tables/create... in progress' }
    }

    return createTables((err, result) => {
        DDL_lock = null
        if (err) {
            console.log(err.stack)
            return res.status(500).send({ error: err })
        } else {
            return res.status(200).send({ message: result })
        }
    })
})


app.post('/admin/database/tables/load/labels', (req, res) => {
   
    if (adminPasswd && (adminPasswd !== (req.body.password || req.query.password))) {
        return res.status(403).send({ error: 'admin/* routes require a vaild password in the body or query params.' })
    }

    if (DDL_lock) {
        return res.status(503).send({ 
            error: 'Only one DDL operation request allowed at a time.\n' + 
                   'Lock currently held by ' + DDL_lock.message
        })
    } else {
        DDL_lock = { message: '/admin/database/tables/load/labels... in progress' }
    }

    return loadLabels((err, result) => {
        DDL_lock = null
        if (err) {
            console.log(err.stack)
            return res.status(500).send({ error: err })
        } else {
            return res.status(200).send({ message: result })
        }
    })
})


app.post('/admin/database/tables/load/states', (req, res) => {

    if (adminPasswd && (adminPasswd !== (req.body.password || req.query.password))) {
        return res.status(403).send({ error: 'admin/* routes require a vaild password in the body or query params.' })
    }

    let states = req.body.states

    if (DDL_lock) {
        return res.status(503).send({ 
            error: 'Only one DDL operation request allowed at a time.\n' + 
                   'Lock currently held by ' + DDL_lock.message
        })
    } else {
        DDL_lock = { message: ('/admin/database/tables/load/states:' + JSON.stringify(states) + '... in progress') }
    }

    return res.status(200).send({ message: "Task started. Poll /admin/status for progress." })

    return loadStatesData(states, DDL_lock, (err, result) => {
        DDL_lock = null
        if (err) {
            console.log(err.stack)
        } else {
        }
    })
})

app.get('/admin/status', (req, res) => {

    if (adminPasswd && (adminPasswd !== (req.query.password))) {
        return res.status(403).send({ 
            error: 'admin/* routes require a vaild password in the body or query params.' })
    }

    res.status(200).send((DDL_lock && DDL_lock.message) || 'No work in progress.')
})

app.post('/admin/database/tables/load/states/all', (req, res) => {
   
    if (adminPasswd && (adminPasswd !== (req.body.password || req.query.password))) {
        return res.status(403).send({ error: 'admin/* routes require a vaild password in the body or query params.' })
    }

    if (DDL_lock) {
        return res.status(503).send({ 
            error: 'Only one DDL operation request allowed at a time.\n' + 
                   'Lock currently held by ' + DDL_lock.message
        })
    } else {
        DDL_lock = '/admin/database/tables/load/states/all... in progress'
    }

    res.status(200).send({ message: "Starting to load ALL data. This will take a few hours." })

    console.time('/admin/database/tables/load/all')

    return loadAllStates(DDL_lock, (err, result) => {
        DDL_lock = null
        if (err) {
            console.error(err.stack)
        }
        console.timeEnd('/admin/database/tables/load/all')
    })
})


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
            return res.status(200).send({ data: result.rows })
        }
    })
})


app.listen(port, function () {
    console.log('App listening on port ' + port)
})
