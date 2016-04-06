'use strict'

/*
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



const _ = require('lodash')



const workerCategories = [
    'agegrp',
    'education',
    'ethnicity',
    'race',
    'sex',
]

const firmCategories = [
    'firmage',
    'firmsize',
]


let validateWorkerCharacteristicCombinations = (reqCatObj) => {

    let badCombos = []


    if (reqCatObj.agegrp && reqCatObj.education) {
        badCombos = _.union(badCombos, ['agegrp', 'education'])
    }

    if (reqCatObj.agegrp && reqCatObj.ethnicity) {
        badCombos = _.union(badCombos, ['agegrp', 'ethnicity'])
    }

    if (reqCatObj.agegrp && reqCatObj.race) {
        badCombos = _.union(badCombos, ['agegrp', 'race'])
    }

    if (reqCatObj.education && reqCatObj.ethnicity) {
        badCombos = _.union(badCombos, ['education', 'ethnicity'])
    }

    if (reqCatObj.education && reqCatObj.race) {
        badCombos = _.union(badCombos, ['education', 'race'])
    }

    if (reqCatObj.sex && reqCatObj.race) {
        badCombos = _.union(badCombos, ['sex', 'race'])
    }

    if (reqCatObj.sex && reqCatObj.ethnicity) {
        badCombos = _.union(badCombos, ['sex', 'ethnicity'])
    }


    if (!badCombos.length) {
        return ''
    } else {
        badCombos.sort()

        return 'The combination of ' + _.slice(badCombos, 0, (badCombos.length - 1)).join(', ') +
               ' and ' + _.last(badCombos) + ' is not supported. ' + 
               'See the documentation for valid worker characteristics combinations.\n' 
    }
}


let validateFirmCharacteristicCombinations = (reqCatObj) => {
    if (reqCatObj.firmage && reqCatObj.firmsize) {
        return 'The combination of firmage and firmsize is not supported. ' + 
               'See the documentation for valid worker characteristics combinations.\n' 
    } 

    return ''
}


let verifyCategoriesSupported = (categories) => {
    let unsupportedCategories = _.difference(categories, workerCategories.concat(firmCategories))

    if (unsupportedCategories.length) {
        return 'The following requested categor' + 
                ((unsupportedCategories.length > 1) ? 'ies are ' : 'y is ') +  
                'not recognized: [' + unsupportedCategories.join(', ') + '].\n'
    } 

    return ''
}


module.exports = {
    
    validateRequestedCategories : (categories) => {

        let reqCatObj = categories.reduce((acc, cat) => { 
                                       acc[cat] = 2
                                       return acc 
                                   }, {}) 

        let errorMessage = ''

        errorMessage += verifyCategoriesSupported(categories)
        errorMessage += validateWorkerCharacteristicCombinations(reqCatObj)
        errorMessage += validateFirmCharacteristicCombinations(reqCatObj)

        if (errorMessage) {
            throw new Error(errorMessage)
        }   
    }
}
