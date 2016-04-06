"use strict";


const app = require('express')()
const _ = require('lodash')

const validateRequestedCategories = require('./src/services/CategoryValidationService').validateRequestedCategories
const getTableName = require('./src/services/TableService').getTableName



var port = (require('process').env.PORT || 10101)


app.get('/*', (req, res) => {

    let url = req.url.toLowerCase().replace(/flavicon\.ico/, '')

    let requestedCategories = url.split('/').filter(s => s)


    try {
        validateRequestedCategories(requestedCategories)
    } catch (err) {
        console.error(err.stack);
        return res.status(400).json({ error: err.message })
    }

    let tableName = getTableName(requestedCategories) 

    tableName.toLowerCase()
    
    return res.status(200).send(tableName)
});


app.listen(port, function () {
    console.log('App listening on port ' + port)
});
