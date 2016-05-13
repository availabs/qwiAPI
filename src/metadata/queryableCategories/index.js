const otherCategories = [
    'geography',
    'industry',
    'year',
    'quarter',
]

const demographicCategories = require('../aggregationCategories').demographic
const firmCategories = require('../aggregationCategories').firm

module.exports = otherCategories.concat(demographicCategories, firmCategories)
