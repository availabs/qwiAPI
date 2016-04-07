"use strict"


const app = require('express')()
const _ = require('lodash')


const validateRequestedCategories = require('./src/services/CategoryValidationService').validateRequestedCategories
const validateRequestedMeasures = require('./src/services/MeasureValidationService').validateRequestedMeasures
const buildSQLString = require('./src/builders/SQLStringBuilder').buildSQLString


const getTableName = require('./src/services/TableService').getTableName



var port = (require('process').env.PORT || 10101)


app.get('/*', (req, res) => {

    let url = req.url

    if (url === '/favicon.ico') { return res.status(400).send({ error: 'This is an API server. No favicons.' }) }
        

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
    
    return res.status(200).send(sqlString)
})


app.listen(port, function () {
    console.log('App listening on port ' + port)
})
