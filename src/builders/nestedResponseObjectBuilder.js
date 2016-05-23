'use strict'


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

      (cur[row[column]] || (cur[row[column]] = [])).push(row)
    }

    return cb(null, nestedResult)
  } catch (err) {
    return cb(err)
  }
}


module.exports = {
  build: build,
}
