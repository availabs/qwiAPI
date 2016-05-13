'use strict'


const _ = require('lodash')

const indicatorLabels = require('../metadata/labels/indicators')



const supportedIndicators = Object.keys(indicatorLabels).map(l => l.toLowerCase())



const validateRequestedIndicators = (requestedIndicators, callback) => {
    
    let unsupportedIndicators = _.difference(requestedIndicators, supportedIndicators)

    if (unsupportedIndicators.length) {
        return callback(new Error(
            'The following requested indicator' + 
                ((unsupportedIndicators.length > 1) ? 's are ' : ' is ') +
                'not recognized: [' + unsupportedIndicators.join(', ') + '].\n'))
    } 

    callback(null)
}


module.exports = {
  validateRequestedIndicators : validateRequestedIndicators,
}
