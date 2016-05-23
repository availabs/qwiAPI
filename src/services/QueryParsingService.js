'use strict'


const _ = require('lodash')
const async = require('async')

const categoryVariableLengths = require('../../metadata/indentifiers').variableLengths

const categoryNamesRegExp = new RegExp(require('../../metadata/indentifiers').names.map(name => `^${name}`).join('|'))

const categoricalVariableLabels = require('../../metadata/labels/categorical_variables')


const CategoryValidationService = require('./CategoryValidationService.js')
const RequestedFieldsValidationService = require('./RequestedFieldsValidationService.js')
const TableService = require('./TableService')



const getCategoryName = (requestedCategoryPredicate) => {
  let categoryMatch = requestedCategoryPredicate.match(categoryNamesRegExp)

  // If the category is not recognized, throw an error.
  // This prevents running futile queries, gives meaningful errors to client, and guards agains SQL-injection.
  if (!categoryMatch) {
    throw new Error(`Invalid category query: unrecognized category in ${requestedCategoryPredicate}`)
  }

  return categoryMatch[0]
}

const newDuplicateCategoryChecker = () => {
  let seenCategories = {}

  return (categoryName) => {
    if (seenCategories[categoryName]) {
      throw new Error(`${categoryName} appears more than once in the dynamic route.`)
    }

    seenCategories[categoryName] = 1
  }
}


const getRequestedValues = (categoryName, reqCategoryPredicate) => {
  let requestedValuesString = (reqCategoryPredicate.slice(categoryName.length) || null)

  if (requestedValuesString === null) { // Only a category name was specified.
    return null
  }

  if (requestedValuesString.length % categoryVariableLengths[categoryName]) {
    throw new Error('The filter values for ' + categoryName + ' are not the expected length.')
  }

  let valChunkerRegExp = new RegExp('.{1,'+ categoryVariableLengths[categoryName] + '}', 'g')

  let requestedValues = requestedValuesString.match(valChunkerRegExp).sort()

  let labelsTable = categoricalVariableLabels[categoryName]

  if (labelsTable) {
    _.every(requestedValues, val => {
      if (!labelsTable[val.toUpperCase()]) {
        console.log(labelsTable)
        throw new Error(`ERROR: ${val} is not in the domain of ${categoryName}.`)
      }
    })
  } else {
    // If there are no labels, the category's values are numeric codes.
    // This is the case for geography, year, quarter.
    // We validate by parsing the integer values. Note: For industry, we remove the '-' character.
    _.every(requestedValues, val => {
      if (isNaN(parseInt(val.replace(/-/, '')))) {
        throw new Error(`ERROR: ${val} is not in the domain of ${categoryName}.`)
      }
    }) 
  }

  return requestedValues
}


const getFields = (query) => {
  let fields = (query && query.fields) || null
  
  if (Array.isArray(fields)) {
    fields = fields.filter(f => f)
    if (!fields.length) {
      fields = null
    }
  } else if (fields) {
    fields = [fields]
  }

  return fields
}


const parse = (request, cb) => {

  try {

    let url   = request.url.replace('/data/', '')
    let query = request.query 
    

    let requestedCategoryPredicates = url.toLowerCase()    // For case insensitive queries
                                         .split('?')[0]    // The URL before the query params
                                         .split('/')       // Split on the '/' character
                                         .filter(s => s)   // Get rid of empty strings

    let checkIfDuplicateCategory = newDuplicateCategoryChecker()

    let categoryNames = []

    let categoryPredicates = requestedCategoryPredicates.reduce((acc, reqCategoryPredicate) => {

      let categoryName = getCategoryName(reqCategoryPredicate)

      checkIfDuplicateCategory(categoryName)

      categoryNames.push(categoryName) // Keeps the order for proper nesting of query result object

      acc[categoryName] = getRequestedValues(categoryName, reqCategoryPredicate)

      return acc
    }, {})
    
    let fields = getFields(query)

    let validators = [
      CategoryValidationService.validateCategoryCombinations.bind(null, categoryNames),
      RequestedFieldsValidationService.validateRequestedFields.bind(null, fields)
    ]

    async.parallel(validators, (err) => {
      if (err) {
        return cb(err)
      }

      let tableName = TableService.getTableName(categoryNames)

      let flatResult = !!(query && query.flat && (query.flat.toLowerCase() === 'true'))

      return cb(null, {
        tableName          : tableName,
        categoryNames      : categoryNames,
        categoryPredicates : categoryPredicates,
        fields             : fields,
        flatResult         : flatResult,
      })
    })

  } catch (e) {
    return cb(e)
  }
}


module.exports = {
  parse : parse,
}
