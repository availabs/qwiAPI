'use strict'


const _ = require('lodash')

const aggregationCategoryDefaults = require('../data/aggregation_categories/defaults')


const codeLengths = {
    agegrp    : 2,
    education : 1,
    ethnicity : 1,
    firmage   : 1,
    firmsize  : 1,
    geography : 7,
    industry  : 2,
    race      : 1,
    sex       : 1,
    year      : 4,
    quarter   : 1,
}


const codePrefixes = {
    agegrp    : 'A',
    education : 'E',
    ethnicity : 'A',
    race      : 'A',
}

//module.exports = { 
    //'agegrp'      : 'A00',
    //'education'   : 'E0',
    //'ethnicity'   : 'A0',
    //'firmage'     : '0',
    //'firmsize'    : '0',
    //'industry'    : '00', //Not sure about this one.
    //'ownercode'   : 'A05',
    //'periodicity' : 'Q',
    //'race'        : 'A0',
    //'seasonadj'   : 'U',
    //'sex'         : '0',
//}



// NOTE: There is no default geography.
function getDefaults (tableName, categoriesWithConditions) {
    
    let defaults = {
        ownercode   : ['A05'],
        periodicity : ['Q'],
        seasonadj   : ['U'],
    }

    let tableCategories = tableName.split('_')

    let workerCategories = tableCategories[0]

    let firmCategories = tableCategories[1]



    // If we are using a sa* or se* table, and sex is not a projected category, 
    // in the SQL query we must ask for the results aggregated over both sexes. 
    if ((workerCategories === 'sa' || workerCategories === 'se') && !categoriesWithConditions.sex) {
        defaults.sex = [aggregationCategoryDefaults.sex]
    }

    // If we are using the sa* table but agegrp is not projected, we must aggregate over agegrp.
    if ((workerCategories === 'sa') && !categoriesWithConditions.agegrp) {
        defaults.agegrp = [aggregationCategoryDefaults.agegrp]
    }

    // If we are using the se* table but education is not projected, we must aggregate over education.
    if ((workerCategories === 'se') && !categoriesWithConditions.education) {
        defaults.education = [aggregationCategoryDefaults.education]
    }


    // If we are using the rh* table but ethnicity is not projected, we must aggregate over ethnicity.
    if ((workerCategories === 'rh') && !categoriesWithConditions.ethnicity) {
        defaults.ethnicity = [aggregationCategoryDefaults.ethnicity]
    }

    // If we are using the rh* table but race is not projected, we must aggregate over race.
    if ((workerCategories === 'rh') && !categoriesWithConditions.race) {
        defaults.race = [aggregationCategoryDefaults.race]
    }


    // If we are using the rh* table but race is not projected, we must aggregate over race.
    if ((workerCategories === 'fa') && !categoriesWithConditions.firmage) {
        defaults.firmage = [aggregationCategoryDefaults.firmage]
    }

    // If we are using the rh* table but race is not projected, we must aggregate over race.
    if ((workerCategories === 'fs') && !categoriesWithConditions.firmsize) {
        defaults.firmsize = [aggregationCategoryDefaults.firmsize]
    }


    // If industry not projected, aggregate over it.
    if (!categoriesWithConditions.industry) {
        defaults.industry = [aggregationCategoryDefaults.industry]
    }

    return defaults
}

/**
 * The reqCatWithConds parameter is an array strings representing category names followed by the numeric filters.
 */
function buildSQLString (tableName, reqCategoriesWithConds, requestedMeasures) {
    
    // Builds a map of "category" -> [filter values]
    let categoriesWithConds = reqCategoriesWithConds.reduce((acc, cat) => {
        let m = cat.match(/\d+/)
            
        let catName = (m) ? cat.substring(0, m.index) : cat

        if (m && (m[0].length % codeLengths[catName])) {
            throw new Error('The filter values for ' + catName + ' are not the expected length.')
        }

        let numChunker = new RegExp('.{1,'+ codeLengths[catName] + '}', 'g')
        let filterVals = (m) ? (m[0].match(numChunker)) : []

        // We omit the letter prefixes in the url. Now we put them back.
        if (codePrefixes[catName]) {
            filterVals = filterVals.map(v => (codePrefixes[catName] + v))
        }

        acc[catName] = filterVals

        return acc
    }, {})
    
    let categoryNames = Object.keys(categoriesWithConds)

    let toProject = _.concat(categoryNames, requestedMeasures).filter(k => k)

    let defaults = getDefaults(tableName, categoriesWithConds)

    let predicates = _.merge(categoriesWithConds, defaults)

    toProject = _.uniq(toProject.concat(['geography', 'year', 'quarter']))

    return  'SELECT ' + toProject.join(', ') + '\n' +
            'FROM '   + tableName + '\n' + 
            'WHERE ' + 
                _.map(predicates, (filterValArray, category) => {

                    // For geographies, we do a prefix match
                    // This allows us to get all the metro-level data for a state, for example.
                    if ((category === 'geography') && (filterValArray.length)) {
                        // For prefix matching, we remove the zero padding if it exists.
                        // Because some state fips codes start with zero, we remove
                        // the leading zeros iff there is more than leading zero.
                        // If we remove leading zeros, we must take care not to remove the leading 
                        // zero of the padded fips code.
                        let codes = filterValArray.map(code => code.replace(/^0{2,5}/, ''))
                        return '(' +  codes.map(code => `(${category} LIKE '${code}%')`).join(' OR ') + ')'
                    }

                    // Years and quarters are numeric data types in the table.
                    if ((category === 'year') || (category === 'quarter')) {
                        return '(' + filterValArray.map(val => `(${category} = ${val})`).join(' OR ') + ')'
                    }

                    return '(' + ((filterValArray.length) ?
                                    (filterValArray.map(val => `(${category} = '${val}')`).join(' OR ')) :
                                     `${category} <> '${aggregationCategoryDefaults[category]}'`) + ')'

                }).join(' AND \n') + 
            ';'
}


module.exports = {
    buildSQLString : buildSQLString
}
