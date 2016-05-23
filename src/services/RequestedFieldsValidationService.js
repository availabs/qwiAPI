'use strict'


const _ = require('lodash')


const labels = require('../../metadata/labels')

const supportedIndicators = Object.keys(labels.indicators).map(l => l.toLowerCase())
const supportedIdentifiers = Object.keys(labels.identifiers).map(l => l.toLowerCase())
const supportedStatusFlags = Object.keys(labels.status_flags).map(l => l.toLowerCase())

const supportedFields = _.union(supportedIndicators, supportedIdentifiers, supportedStatusFlags)



const validateRequestedFields = (requestedFields, callback) => {
    
    if (requestedFields === null) {
      return callback(null)
    }

    let requestedFields_lowerCase = requestedFields.map(f => f.toLowerCase())

    let unsupportedFields = _.difference(requestedFields_lowerCase, supportedFields)

    if (unsupportedFields.length) {
        return callback(new Error(
            'The following requested indicator' + 
                ((unsupportedFields.length > 1) ? 's are ' : ' is ') +
                'not recognized: [' + unsupportedFields.join(', ') + '].\n'))
    } 

    callback(null)
}



module.exports = {
  validateRequestedFields : validateRequestedFields,
}
