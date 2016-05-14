'use strict'


const build = (result, nestingCategories) => {
  
  let nestedResult = {}
  let cur
  let column

  for (let i = 0; i < result.length; ++i) {
    
    let row = result[i]

    row.geography = row.geography.trim()

    cur = nestedResult
    for (let i = 0; i < (nestingCategories.length - 1); ++i) {
      column = nestingCategories[i] 
      
      cur = (cur[row[column]] || (cur[row[column]] = {}))
    }

    column = nestingCategories[nestingCategories.length - 1]

console.log('========>>>', row[column])

    cur[row[column]] = row
  }

  return nestedResult
}


module.exports = {
  build: build,
}
