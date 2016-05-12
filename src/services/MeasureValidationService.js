'use strict'


const _ = require('lodash')

const indicatorLabels = require('../metadata/labels/indicators')



const supportedIndicators = Object.keys(indicatorLabels).map(l => l.toLowerCase())



const validateRequestedIndicators = requestedIndicators => {
    
    let unsupportedIndicators = _.difference(requestedIndicators, supportedIndicators)

    if (unsupportedIndicators.length) {
        throw new Error(
            'The following requested indicator' + 
                ((unsupportedIndicators.length > 1) ? 's are ' : ' is ') +
                'not recognized: [' + unsupportedIndicators.join(', ') + '].\n')
    } 
}



module.exports = {
  validateRequestedIndicators : validateRequestedIndicators,
}
