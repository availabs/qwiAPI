'use strict'


const _ = require('lodash')

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
                                     parsedQueryObject.alwaysSelected).filter(k => k))

      // If a category is no specified
      let wherePredicates = _.defaults(parsedQueryObject.categoryPredicates, 
                                       parsedQueryObject.defaultCategoryPredicates)


      if (_.isEmpty(wherePredicates.geography)) {
        return cb(new Error('For metro-level queries, you must specify the metro codes to return.'))
      }

      parsedQueryObject.sqlStatement = 
        'SELECT ' + toSelect.join(', ') + '\n' +
        'FROM '   + parsedQueryObject.tableName + '\n' + 
        'WHERE ' + 
            _.map(wherePredicates, (reqCategoryValues, categoryName) => {

              // The client specified requested values for the category.
              if (reqCategoryValues && reqCategoryValues.length) {
                if (categoryName === 'geography') {
                    return '(' +  reqCategoryValues.map(code => `(geography = '${code}')`).join(' OR ') + ')'
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
                return '(' +reqCategoryValues.map(val => `(${categoryName} = '${val.toUpperCase()}')`).join(' OR ')+')'

              } else {
                // No requested values for the category that were requested.
                // In this case, if the category has a default value that represents
                // the sum across all members of the category, we exclude that value from the result.
                return (_.includes(parsedQueryObject.alwaysSelected, categoryName)) ? '' :
                  '(' + `${categoryName} <> '${parsedQueryObject.categoryVariableDefaults[categoryName]}'` + ')'
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
