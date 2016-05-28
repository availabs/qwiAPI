'use strict'

const _ = require('lodash')

const build = (parsedQueryObject, cb) => {
  
  try {
    let rows = parsedQueryObject.result.rows

    if (parsedQueryObject.flatResult) {
      return cb(null, rows)
    }

    let nestingCategories = parsedQueryObject.categoryNames
    let nestedResult = {}
    let cur
    let column
    let i, j
    let data

    for (i = 0; i < rows.length; ++i) {
      
      let row = rows[i]

      row.geography = row.geography.trim()

      cur = nestedResult
      for (j = 0; j < (nestingCategories.length - 1); ++j) {
        column = nestingCategories[j] 
        cur = (cur[row[column]] || (cur[row[column]] = {}))
      }

      // The last column in the nesting.
      column = nestingCategories[j];

      data = (parsedQueryObject.denseResult) ? _.omit(row, nestingCategories) : row;

      if (parsedQueryObject.flatLeaves) {
        if (cur[row[column]]) {
          throw new Error('Flat leaves requested, but data at leaves is 2-dimensional.')
        }
        cur[row[column]] = data
      } else {
        (cur[row[column]] || (cur[row[column]] = [])).push(data)
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
