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


const demographicCategories = require('../metadata/aggregationCategories/demographic')
const firmCategories = require('../metadata/aggregationCategories/firm')

const queryableCategories = require('../metadata/queryableCategories')

const validWorkerCategoryCombinations = [
  ['agegrp',    'sex'],
  ['education', 'sex'],
  ['ethnicity', 'race'],
]

// Code taken from http://codereview.stackexchange.com/a/75663
const pairwise = (list) => {
  if (list.length < 2) { return [] }
  let first = _.first(list),
      rest  = _.rest(list),
      pairs = _.map(rest, x => [first, x])
  return _.flatten([pairs, pairwise(rest)], true)
}



const verifyCategoriesSupported = (categories) => {
    let unsupportedCategories = _.difference(categories, queryableCategories)

    if (unsupportedCategories.length) {
        'The following requested categor' + 
            ((unsupportedCategories.length > 1) ? 'ies are ' : 'y is ') +  
            'not recognized: [' + unsupportedCategories.join(', ') + '].\n'
    } 
}


// The following function makes sure the requested category combination is supported by the dataset.
const validateWorkerCharacteristicCombinations = (reqCategories) => {

    let reqWorkerCategories = _.intersection(reqCategories, demographicCategories).sort()
     
    let invalidCombos = _.differenceWith(pairwise(reqWorkerCategories), validWorkerCategoryCombinations, _.equals) 

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
  verifyCategoriesSupported,
  validateWorkerCharacteristicCombinations,
  validateFirmCharacteristicCombinations,
]


const validateRequestedCategories = (categories, callback) => {
  let errorMessage = allValidators.map(validator => validator(categories)).filter(e => e).join('\n')

  callback(errorMessage ? new Error(errorMessage) : null)
}


module.exports = {
  validateRequestedCategories,
}
