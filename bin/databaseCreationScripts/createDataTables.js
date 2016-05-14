#!/usr/bin/env node

'use strict'

const path = require('path')
const _ = require('lodash')

const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/postgres_db.env'))

const dbService = require(path.join(projectRoot, 'src/services/DBService'))

const demographicCategories = ['sa', 'se', 'rh']
const firmCategories = ['fa', 'fs']


// Metro level, Sector level
const aggregation = 'gm_ns_op_u'

const createDataTableCommandGenerator = require('./createDataTableCommandGenerator')


let tablenames = 
  _.flatMap(demographicCategories, dCat => _.map(firmCategories, fCat => `${dCat}_${fCat}_${aggregation}`))

let sqlCommand = tablenames.map(tableName => createDataTableCommandGenerator(tableName)).join('')


dbService.runQuery(sqlCommand, (err, result) => { 
  if (err) {
    return console.error(err) 
  }
  
  console.log(result)
})


