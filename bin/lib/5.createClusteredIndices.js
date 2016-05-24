#!/usr/bin/env node

/**
 * Usage: 
 *    Takes a single optional flag, --tables.
 *      List the tables on which to build the clustered index.
 *      e.g.:
 *        ./5.createClusteredIndices.js --tables="rh_fa_gm_ns_op_u rh_fs_gm_ns_op_u"
 */

'use strict'


const path = require('path')
const async = require('async')
const _ = require('lodash')


const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/postgres_db.env'))

const argv = require('minimist')(process.argv.slice(2))

const dbService = require(path.join(projectRoot, 'src/services/DBService'))

const tables = (argv.tables) ? argv.tables.split(/\s/) : require(path.join(projectRoot, 'metadata/tables')).names


const sqlCommands = _.flatMap(tables, tableName => {
  let indexName = `${tableName}_clusteringIndex`

  return [
    `DROP INDEX IF EXISTS ${indexName};`,
    `CREATE INDEX ${indexName} ON ${tableName} (geography, year, quarter) WITH (fillfactor = 100);`,
    `CLUSTER VERBOSE ${tableName} USING ${indexName};`,
  ]
})

const tasks = sqlCommands.map(comm => (cb) => {
  console.time(comm)
  dbService.runQuery(comm, (err) => {
    console.timeEnd(comm)
    cb(err)
  })
})


async.series(tasks, (err) => {
  dbService.end()
  if (err) {
    return console.error(err.stack)
  }
  console.log("All clustered indices successfully built.")
})
