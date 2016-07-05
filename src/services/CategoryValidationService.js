/*
Only certain combinations of demographic and firm categories are valid. This is because the data in the QWI dataset is made available in the following groupings:

    The demographic categories available on the QWI include:
        agegrp    (in sa_* tables)
        education (in se_* tables)
        ethnicity (in rh_* tables)
        race      (in rh_* tables)
        sex       (in s* tables)

    The firm categories available are:
        firmage  (in *_fa_* tables)
        firmsize (in *_fs_* tables)
*/

'use strict'

const _ = require('lodash')


const demographicCategories = require('../../metadata/identifiers').demographicCategories
const firmCategories = require('../../metadata/identifiers').firmCategories

const validDemographicCategoryCombinations = require('../../metadata/tables').validDemographicCategoryCombinations


// Code taken from http://codereview.stackexchange.com/a/75663
const pairwise = (list) => {
  if (list.length < 2) { return [] }
  list.sort()
  let first = _.head(list),
      rest  = _.tail(list),
      pairs = _.map(rest, x => [first, x])
  return _.flatten([pairs, pairwise(rest)], true)
}


// The following function makes sure the requested category combination is supported by the dataset.
const validateWorkerCharacteristicCombinations = (reqCategories) => {
    let reqWorkerCategories = _.intersection(reqCategories, demographicCategories).sort()

    let invalidCombos = _.differenceWith(pairwise(reqWorkerCategories), validDemographicCategoryCombinations, _.isEqual)

    if (invalidCombos.length) {
      return 'The following combination pairs are not supported: [' + invalidCombos.join(', ') + ']'
    }
}


const validateFirmCharacteristicCombinations = (categories) => {
    let reqFirmCategories = _.intersection(categories, firmCategories)

    if (reqFirmCategories.length > 1) {
        return 'The combination of firmage and firmsize is not supported.'
    } 
}


const allValidators = [
  validateWorkerCharacteristicCombinations,
  validateFirmCharacteristicCombinations,
]


const validateCategoryCombinations = (categories, callback) => {
  let errorMessage = allValidators.map(validator => validator(categories)).filter(e => e).join('\n')

  callback(errorMessage ? new Error(errorMessage) : null)
}


module.exports = {
  validateCategoryCombinations,
}
