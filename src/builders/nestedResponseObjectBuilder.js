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

    for (let i = 0; i < rows.length; ++i) {
      
      let row = rows[i]

      row.geography = row.geography.trim()

      cur = nestedResult
      for (let i = 0; i < (nestingCategories.length - 1); ++i) {
        column = nestingCategories[i] 
        
        cur = (cur[row[column]] || (cur[row[column]] = {}))
      }

      column = nestingCategories[nestingCategories.length - 1]

      cur[row[column]] = row
    }

    return cb(null, nestedResult)
  } catch (err) {
    return cb(err)
  }
}


module.exports = {
  build: build,
}
