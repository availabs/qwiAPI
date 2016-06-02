'use strict'


const _ = require('lodash')


const categoryVariableDefaults = 
        _.mapValues(_.pick(require('../../metadata/identifiers').variableDefaults, 'industry'), (x => [x]))

const alwaysSelected = ['firmage', 'geography', 'year', 'quarter']


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

      let wherePredicates = _.defaults(parsedQueryObject.categoryPredicates, categoryVariableDefaults)


      // If no geography codes are provided, we default to returning the data for all the states.
      if (!wherePredicates.geography) {
        return cb(new Error('You must specify a geography or geographies.'))
      }

     parsedQueryObject.sqlStatement = 
        'SELECT ' + toSelect.join(', ') + '\n' +
        'FROM '   + parsedQueryObject.tableName + '\n' + 
        'WHERE ' + 
            _.map(wherePredicates, (reqCategoryValues, categoryName) => {

              // The client specified requested values for the category.
              if (reqCategoryValues && reqCategoryValues.length) {
                if (categoryName === 'geography') {
                    // For prefix matching, we remove the zero padding if it exists.
                    // Because some state fips codes start with zero, we must take care 
                    // not to remove the leading zeroes of the padded fips code... thus the `{2,5}`.
                    let codes = reqCategoryValues.map(code => code.replace(/^0{2,5}/, ''))
                    return '(' +  codes.map(code => `(geography = '${code}')`).join(' OR ') + ')'
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
                return '('+ reqCategoryValues.map(val =>`(${categoryName} = '${val.toUpperCase()}')`).join(' OR ') +')'

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
