'use strict'

const _ = require('lodash')

const build = (parsedQueryObject, cb) => {
  
  try {
    let rows = parsedQueryObject.result.rows

    // Trim all the strings at the leaves.
    rows = rows.map(row => _.mapValues(row, val => (val && val.trim) ? val.trim() : val))

    if (parsedQueryObject.flatResult) {
      return cb(null, rows)
    }

    let nestingCategories = parsedQueryObject.categoryNames
    let nestedResult = {}
    let cur
    let column
    let value
    let i, j
    let data

    for (i = 0; i < rows.length; ++i) {
      
      let row = rows[i]


      cur = nestedResult
      for (j = 0; j < (nestingCategories.length - 1); ++j) {
        column = nestingCategories[j] 
        value = (row[column] && row[column].trim) ? row[column].trim() : row[column]
        cur = (cur[value] || (cur[value] = {}))
      }

      // The last column in the nesting.
      column = nestingCategories[j]
      value = (row[column] && row[column].trim) ? row[column].trim() : row[column]

      data = (parsedQueryObject.denseResult) ? _.omit(row, nestingCategories) : row

      if (parsedQueryObject.flatLeaves) {
        if (cur[value]) {
          throw new Error('Flat leaves requested, but data at leaves is 2-dimensional.')
        }
        cur[value] = data
      } else {
        (cur[value] || (cur[value] = [])).push(data)
      }
    }

    return cb(null, nestedResult)
  } catch (err) {
    return cb(err)
  }
}


module.exports = {
  build: build,
}
