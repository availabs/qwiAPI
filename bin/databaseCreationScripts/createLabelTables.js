#!/usr/bin/env node

'use strict'

const path = require('path')
const _ = require('lodash')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/postgres_db.env'))

require('process').env

const projectRoot = path.join(__dirname, '../../')

const dbService = require(projectRoot, 'services/DBService')



// The labelsObj is nested. We need to flatten it.
const f = (a,o,k) => ((_.isObject(_.sample(_.values(o)))) ? _.reduce(o, f, a) : (a[k] = o)) && a
const labelsObj = _.reduce(require(projectRoot, 'src/metadata/labels'), f, {})

const insertStatementBuilder = (table, label, field) => 
  "INSERT INTO label_" +table+ " VALUES ('" + field.replace(/'/, '') + "','" + label.replace(/'/, '') + "');"
 

const sqlCommands = _.map(labelsObj, (v, k) => 
  "DROP TABLE IF EXISTS label_" + k + "; " + 
  "CREATE TABLE label_" + k + " (" + k.replace(/s$/, '') + " VARCHAR PRIMARY KEY, label VARCHAR);" +
  _.map(v, (label, field) => insertStatementBuilder(k, label, field)).join('')
).join('')


dbService.runQuery(sqlCommands, (err, result) => { 
  if (err) {
    return console.error(err) 
  }
  
  console.log(result)
})

