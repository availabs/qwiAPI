'use strict'


const _ = require('lodash')

const categoryVariableDefaults = require('../../metadata/identifiers').variableDefaults

const defaultCategoryPredicates = _.reduce(categoryVariableDefaults, (acc, defaultValue, categoryName) => {
                                            acc[categoryName] = [defaultValue]
                                            return acc
                                           }, {})

const alwaysSelected = ['geography', 'year', 'quarter']


/**
 *  The parsedQueryObject parameter should be the output from QueryParsingService.parse.
 *
 *  If the value for a categoryPredicates entry is null, that means that all 
 *    values except for the aggregate column value will be returned.
 *
 *  If the value for a categoryPredicates value is undefined, it is replaced with the category defaults.
 *    
 * WARNING: This function expects the categoryQueryPredicates and requestedFields to be validated beforehand. 
 *          !!! Without prior validation, this code is completely vulnerable to SQL-injection !!!
 */
function buildSQLString (parsedQueryObject, cb) {

    try {

      let toSelect = _.uniq(_.concat(parsedQueryObject.categoryNames, 
                                     parsedQueryObject.fields, 
                                     alwaysSelected).filter(k => k))

      // If a category is no specified
      let wherePredicates = _.defaults(parsedQueryObject.categoryPredicates, defaultCategoryPredicates)


      // If no geography codes are provided, we default to returning the data for all the states.
      if (!wherePredicates.geography) {
        // We do not allow the all metros request. Client must specifically request metro areas.
        if (_.includes(wherePredicates.geo_level, 'm')) {
          return cb(new Error('For metro-level queries, you must specify the metro codes to return.'))
        }

        wherePredicates.geo_level = ['S']
      }

     parsedQueryObject.sqlStatement = 
        'SELECT ' + toSelect.join(', ') + '\n' +
        'FROM '   + parsedQueryObject.tableName + '\n' + 
        'WHERE ' + 
            _.map(wherePredicates, (reqCategoryValues, categoryName) => {

              // The client specified requested values for the category.
              if (reqCategoryValues && reqCategoryValues.length) {
                // For geographies, we do a prefix match
                // This allows us to get all the metro-level data for a state, for example.
                if (categoryName === 'geography') {
                    // For prefix matching, we remove the zero padding if it exists.
                    // Because some state fips codes start with zero, we must take care 
                    // not to remove the leading zeroes of the padded fips code... thus the `{2,5}`.
                    let codes = reqCategoryValues.map(code => code.replace(/^0{2,5}/, ''))
                    return '(' +  codes.map(code => `(geography = '${code}')`).join(' OR ') + ')'
                }

                if (categoryName === 'industry') {
                    let codes = reqCategoryValues.map(code => code.replace(/^0{3}/, ''))
                    return '(' +  codes.map(code => `(industry = '${code}')`).join(' OR ') + ')'
                }

                // Years and quarters are numeric data types in the table.
                if (categoryName === 'quarter') {
                    let quarters = reqCategoryValues.map(i => parseInt(i))

                    return '(' + quarters.map(qtr => `(quarter = ${qtr})`).join(' OR ') + ')'
                }

                // Years and quarters are numeric data types in the table.
                if (categoryName === 'year') {

                    let years = reqCategoryValues.map(year => parseInt(year)).sort()

                    if (years.length === 2) {
                      return `(year BETWEEN ${years[0]} AND ${years[1]})`
                    }

                    return '(' + years.map(val => `(year = ${val})`).join(' OR ') + ')'
                }

                // Not a special case
                return '(' + reqCategoryValues.map(val => `(${categoryName} = '${val.toUpperCase()}')`).join(' OR ') + ')'

              } else {
                // No requested values for the category that were requested.
                // In this case, if the category has a default value that represents
                // the sum across all members of the category, we exclude that value from the result.
                return (_.includes(alwaysSelected, categoryName)) ? '' :
                  '(' + `${categoryName} <> '${categoryVariableDefaults[categoryName]}'` + ')'
              }


            }).filter(s=>s).join(' AND \n') + 
        ';'

      return cb(null, parsedQueryObject)
    } catch (err) {
      return cb(err)
    }
}


module.exports = {
    buildSQLString : buildSQLString
}
