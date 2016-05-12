#!/usr/bin/env node
/*
  command line args:
    --states: String with states to upload. States separated by spaces.
*/

'use strict'

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const iconv = require('iconv-lite')


const argv = require('minimist')(process.argv.slice(2))

const async = require('async')
const pg = require('pg')
const copyFrom = require('pg-copy-streams').from
const _ = require('lodash')

const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/postgres_db.env'))
envFile(path.join(projectRoot, 'config/qwi.env'))

const dataDir = path.join(projectRoot, 'data/metros')

const dbService = require(path.join(projectRoot, 'src/services/DBService'))

const tables = require(path.join(projectRoot, 'src/metadata/tables'))

const stateAbbrvToCode = require(path.join(projectRoot, 'src/metadata/geographic/stateAbbreviationToCode'))


const statesToUpload = (argv.states) ? argv.states.toLowerCase().split(' ') : _.keys(stateAbbrvToCode) 


const dataFiles = fs.readdirSync(dataDir)


//setInterval(() => console.log(process._getActiveHandles(), 15000))
//setInterval(() => console.log(process._getActiveRequests(), 10000))
//process.on('uncaughtException', (err) => {
  //console.log(`Caught exception: ${err}`)
//})

const dataFilesByTable = dataFiles.reduce((acc, fileName) => {
  let stateAbbrv = fileName.slice(0,2)
  let tableName  = path.basename(fileName, '.csv.gz').slice(3)

  if (!acc[tableName]) {
    acc[tableName] = []
  }

  acc[tableName].push({
    filePath   : path.join(dataDir, fileName),
    stateAbbrv : stateAbbrv,
    stateCode  : stateAbbrvToCode[stateAbbrv], 
  })

  return acc
}, {})



// postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
const conString = (() => {
    let user   = process.env.POSTGRES_USER
    let passwd = process.env.POSTGRES_PASSWORD || ''
    let netloc = process.env.POSTGRES_NETLOC
    let port   = process.env.POSTGRES_PORT     || ''
    let dbname = process.env.POSTGRES_DB

    return 'postgresql://' + user + (passwd && (':' + passwd)) +'@'+ netloc + (port && (':' + port)) +'/'+ dbname
})()


const uploadFile = (tableName, filePath, cb) => {

  pg.on('error', (err) => console.log('\n\n', err.stack))
  pg.connect(conString, (err, client, done) => {
      let gunzipper = zlib.createGunzip().on('error', done)

      //let copyToDBStream = client.query(copyFrom(`COPY ${tableName} FROM STDIN DELIMITER ',' CSV HEADER`))ww
      let copyToDBStream = client.query(copyFrom(`COPY ${tableName} FROM STDIN DELIMITER ',' CSV HEADER`),
                                        (err, res) => { 
                                            console.log('===>', err || res)
                                            return done() && cb(1)
                                         }
                           )

      let fileReadStream = fs.createReadStream(filePath).on('error', done)

      copyToDBStream.on('error', done)

      let timerLabel = filePath
      console.time(timerLabel)

      let calledBack = false
      fileReadStream.on('error', done)
                    .pipe(gunzipper).on('error', done)
                    .pipe(iconv.decodeStream('iso-8859-1').on('error', done).on('error', done))
                    .pipe(iconv.encodeStream('utf8').on('error', done)).on('error', done)
                    .pipe(copyToDBStream).on('error', done)
                    .on('error', (err) => { 
                        console.timeEnd(timerLabel)
                        console.log(err.stack)
                        if (client) done()
                        if (!calledBack) return (calledBack = true) && cb(1)
                    })
                    .on('end', () => { 
                        if (client) done()
                        if (!calledBack) return (calledBack = true) && cb(null)
                    })
                    .on('finish', () => { 
                        console.timeEnd(timerLabel)
                        if (client) done()
                        if (!calledBack) return (calledBack = true) && cb(null)
                    })
  })
}


const loadDataForTable = (acc, tableName, cb1) => {
  let query = `SELECT DISTINCT geography FROM ${tableName} WHERE char_length(geography) = 2;`


  if (!dataFilesByTable[tableName]) {
    console.log("No data files for table", tableName)
    return cb1(null, acc)
  }

  dbService.runQuery(query, (err, result) => {
    if (err) { 
      console.error(`Could not query ${tableName} for uploaded states.`)
      console.error(err.stack)
      return cb1(null) 
    }

    let rows = result.rows

    let uploadedStates = rows.reduce((acc2, row) => {
      acc2[row.geography.trim()] = 1
        
      return acc2
    }, {})

    // Get the .csv files that haven't yet been uploaded.
    let filesToUpload = dataFilesByTable[tableName].filter( (fileInfo) => 
      !uploadedStates[fileInfo.stateCode] && _.includes(statesToUpload, fileInfo.stateAbbrv)
    )

    if (Object.keys(uploadedStates).length) {
      //console.log("The following files were already uploaded to the database:")
      //console.log(JSON.stringify(_.difference(dataFilesByTable[tableName], filesToUpload), null, 4))
    }

    // We don't terminate on errors. We log them.
    async.reduce(filesToUpload, acc, (acc, fileInfo, cb2) => {
      uploadFile(tableName, fileInfo.filePath, (err) => {
        if (err) {
          // If there was a problem, we will delete the state from the table.
          (acc[tableName] || (acc[tableName] = [])).push(fileInfo.stateCode)
        }

        cb2(null, acc)
      })
    }, cb1)
  })
}


async.reduce(tables, {}, loadDataForTable, (err, result) => {
  if (err) { process.exit(1) }

  let cleanerUpper = 
    (deleteStatement, callback) => {
      dbService.runQuery(
        deleteStatement,
        (err) => { 
          if (err, result) { 
            console.error(err)
          } else {
            console.log(err)
          }
          callback(null)
        })
    }

  let cleanUpTasks = _.map(result, (stateCodes, tableName) => {
    let states = "'" + `${stateCodes.join("','")}` + "'"

    if (states.length) {
      let deleteStatement = `DELETE FROM ${tableName} WHERE substring(geography from 0 for 3) IN (${states})`
      console.log("The following statement is being run because an error occurred while uploading data:")
      console.log(deleteStatement)
      return cleanerUpper.bind(null, deleteStatement) 
    } else return null
  }).filter(t => t)

  

  async.series(cleanUpTasks, () => setTimeout(() => dbService.end, 3000))
})
