"use strict";


const app = require('express')()
const _ = require('lodash')


const validateRequestedCategories = require('./src/services/CategoryValidationService').validateRequestedCategories
const validateRequestedMeasures = require('./src/services/MeasureValidationService').validateRequestedMeasures


const getTableName = require('./src/services/TableService').getTableName



var port = (require('process').env.PORT || 10101)


app.get('/*', (req, res) => {

    let url = req.url.replace(/flavicon\.ico/, '')
        
    let requestedCategories = url.toLowerCase().split('?')[0].split('/').filter(s => s)

    let query = req.query

    let requestedMeasures = Object.keys(query).map( k => k.toLowerCase() )

    let validationErrorMessages = ''

    
    try {
        validateRequestedCategories(requestedCategories)
    } catch (err) {
        validationErrorMessages += err.message + '\n'
        console.error(err.stack);
    }

    try {
        validateRequestedMeasures(requestedMeasures)
    } catch (err) {
        validationErrorMessages += err.message + '\n'
        console.error(err.stack);
    }

    if (validationErrorMessages) {
        return res.status(400).json({ error: validationErrorMessages })
    }



    let tableName = getTableName(requestedCategories) 

    tableName.toLowerCase()
    
    return res.status(200).send(tableName)
});


app.listen(port, function () {
    console.log('App listening on port ' + port)
});
