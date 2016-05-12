const _ = require('lodash')
const codeToAbbrv = require('./stateCodeToAbbreviaton')

module.exports = _.invert(codeToAbbrv)
