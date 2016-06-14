'use strict'


const _ = require('lodash')


const qwiIndicators = require('../../metadata/labels').indicators

const qwiVariableLengths = require('../../metadata/identifiers').variableLengths

const qwiCategoricalVariables = require('../../metadata/labels/categorical_variables')


const supportedIndicators = Object.keys(qwiIndicators).map(l => l.toLowerCase())

const variableDefaults = require('../../metadata/identifiers').variableDefaults


const getCategoryName = (requestedCategoryPredicate, queryableCategories) => {

  let categoryNamesRegExp = new RegExp(queryableCategories.map(name => `^${name}`).join('|'))
  let categoryMatch = requestedCategoryPredicate.match(categoryNamesRegExp)

  // If the category is not recognized, throw an error.
  // This prevents running futile queries, gives meaningful errors to client, and guards agains SQL-injection.
  if (!categoryMatch) {
    throw new Error(`Invalid category: unrecognized category in ${requestedCategoryPredicate}`)
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




const getRequestedValues = (categoryName, reqCategoryPredicate, meta) => {

  let requestedValuesString = (reqCategoryPredicate.slice(categoryName.length) || null)

  if (requestedValuesString === null) { // Only a category name was specified.
    return null
  }

  if (requestedValuesString.length % meta.categoryVariableLengths[categoryName]) {
    throw new Error('The filter values for ' + categoryName + ' are not the expected length.')
  }

  let valChunkerRegExp = new RegExp('.{1,'+ meta.categoryVariableLengths[categoryName] + '}', 'g')

  let requestedValues = requestedValuesString.match(valChunkerRegExp).sort()

  let labelsTable = meta.categoricalVariableLabels[categoryName]

  if (labelsTable) {
    _.every(requestedValues, val => {
      if ((categoryName === 'firmage') && (val.toUpperCase() === 'A00')) {
        // FIXME: specific for table.
        throw new Error(`ERROR: The indicator_ratios_by_firmage table does not have the 'A00' firmage groups.`) 
      }

      if (!labelsTable[val.toUpperCase()]) {
        throw new Error(`ERROR: ${val} is not in the domain of column '${categoryName}' in table '${meta.tableName}'.`)
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


const validateRequestedFields = (requestedFields, supportedFields) => {
    
    if (requestedFields === null) { return }

    let requestedFields_lowerCase = requestedFields.map(f => f.toLowerCase())

    let unsupportedFields = _.difference(requestedFields_lowerCase, supportedFields)

    if (unsupportedFields.length) {
        throw new Error(
            'The following requested indicator' + 
                ((unsupportedFields.length > 1) ? 's are ' : ' is ') +
                'not recognized: [' + unsupportedFields.join(', ') + '].\n')
    } 
}


const parse = (meta, cb) => {

  try {

    let query = meta.query 

    let requestedCategoryPredicates = meta.url.toLowerCase()    // For case insensitive queries
                                              .split('?')[0]    // The URL before the query params
                                              .split('/')       // Split on the '/' character
                                              .filter(s => s)   // Get rid of empty strings

    let checkIfDuplicateCategory = newDuplicateCategoryChecker()

    let categoryNames = []

    let categoryPredicates = requestedCategoryPredicates.reduce((acc, reqCategoryPredicate) => {

      let categoryName = getCategoryName(reqCategoryPredicate, meta.queryableCategories)

      checkIfDuplicateCategory(categoryName)

      categoryNames.push(categoryName) // Keeps the order for proper nesting of query result object

      acc[categoryName] = getRequestedValues(categoryName, reqCategoryPredicate, meta)
      return acc

    }, {})
    

    let fields = getFields(query)

    validateRequestedFields(fields, meta.supportedFields)

    let flatResult = !!(query && query.flat && (query.flat.toLowerCase() === 'true'))

    let denseResult = !!(query && query.dense && (query.dense.toLowerCase() === 'true'))

    if (flatResult && denseResult) {
      throw new Error("Results cannot be both flat and dense.") 
    }

    let flatLeaves = !!(query && query.flatLeaves && (query.flatLeaves.toLowerCase() === 'true'))

    return cb(null, {
      tableName                 : meta.tableName,
      categoryNames             : categoryNames,
      categoryPredicates        : categoryPredicates,
      defaultCategoryPredicates : meta.defaultCategoryPredicates,
      fields                    : fields,
      flatResult                : flatResult,
      denseResult               : denseResult,
      flatLeaves                : flatLeaves,
      alwaysSelected            : meta.alwaysSelected,
    })

  } catch (e) { return cb(e) }
}


const getGenericDerivedDataQueryMetaObj = (request) => {

  let queryableCategories = ['firmage', 'geography', 'industry', 'quarter', 'year']
  let categoryVariableLengths = _.pick(qwiVariableLengths, queryableCategories)

  categoryVariableLengths.geography -= 2

  return {
    query                     : request.query,
    queryableCategories,
    supportedIndicators,
    supportedFields           : _.union(queryableCategories, supportedIndicators),
    categoryVariableLengths,
    categoricalVariableLabels : _.pick(qwiCategoricalVariables, queryableCategories),
  }
}

const parseMeasureRatiosByFirmageQuery = (request, cb) => {

  let meta = getGenericDerivedDataQueryMetaObj(request)

  let supportedRatioIndicators = Object.keys(qwiIndicators).map(l => `${l.toLowerCase()}_ratio`)

  meta.url                 = request.url.replace('/derived-data/measure-ratios-by-firmage', ''),
  meta.tableName           = 'measure_ratios_by_firmage',
  meta.supportedIndicators = supportedRatioIndicators,
  meta.supportedFields     = _.union(meta.queryableCategories, supportedRatioIndicators)

  meta.defaultCategoryPredicates = _.mapValues(_.pick(variableDefaults, 'industry'), (x => [x]))
  meta.categoricalVariableLabels.firmage = _.omit(meta.categoricalVariableLabels.firmage, '0')
  meta.alwaysSelected = ['firmage', 'geography', 'year', 'quarter']

  return parse(meta, cb)
}


const parseInterstateMSAViewQuery = (request, cb) => {

  let meta = getGenericDerivedDataQueryMetaObj(request)

  meta.url       = request.url.replace('/derived-data/interstate-msa', '')
  meta.tableName = 'interstate_msa_view'

  meta.alwaysSelected = ['geography', 'year', 'quarter']

  meta.defaultCategoryPredicates = _.mapValues(_.pick(variableDefaults, 'industry', 'firmage'), (x => [x]))

  return parse(meta, cb)
}


module.exports = {
  parseMeasureRatiosByFirmageQuery,
  parseInterstateMSAViewQuery,
}
