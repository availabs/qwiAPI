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
pg.on('error', (err) => console.log('\n\n', err.stack))

const _ = require('lodash')

const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/postgres_db.env'))
envFile(path.join(projectRoot, 'config/qwi.env'))
const env = process.env


const qwi_release = env.QWI_RELEASE
if (!qwi_release) {
  console.error("The QWI_RELEASE environment variable must be set in config/qwi.env")
}

const dataDir = path.join(projectRoot, `data/metros_${qwi_release}`)

const dbService = require(path.join(projectRoot, 'src/services/DBService'))

const tables = require(path.join(projectRoot, 'metadata/tables')).names

const stateAbbrvToCode = require(path.join(projectRoot, 'metadata/geographic/stateAbbreviationToCode'))


const statesToUpload = (argv.states) ? argv.states.toLowerCase().split(' ') : _.keys(stateAbbrvToCode) 


const dataFiles = fs.readdirSync(dataDir)

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


const errorLogPath = path.join(process.cwd(), `dataUploadErrors.${new Date().toISOString()}.log`)
let errorLog



// postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
const conString = (() => {
    let user   = env.QWI_POSTGRES_USER
    let passwd = env.QWI_POSTGRES_PASSWORD || ''
    let netloc = env.QWI_POSTGRES_NETLOC
    let port   = env.QWI_POSTGRES_PORT     || ''
    let dbname = env.QWI_POSTGRES_DB

    return 'postgresql://' + user + (passwd && (':' + passwd)) +'@'+ netloc + (port && (':' + port)) +'/'+ dbname
})()



const uploadFile = (tableName, filePath, cb) => {

  let delayedCb = () => setTimeout(cb, 1500)

  pg.connect(conString, (err, client, done) => {

      // These are used to make sure actions are not repeated.
      let calledBack = false
      let loggedError = false

      let errorHandler = (err) => {
        if (!loggedError) {
          loggedError = true
          let errorString = `\nError uploading ${filePath}.\n` + err.stack + '\n\n'
          console.log(errorString)
          errorLog = (errorLog || fs.createWriteStream(errorLogPath))
          errorLog.write(errorString)
        }
        done(client)
        if (!calledBack) return ((calledBack = true) && delayedCb())
      }

      let gunzipper = zlib.createGunzip().on('error', errorHandler)

      let copyToDBStream = client.query(copyFrom(`COPY ${tableName} FROM STDIN DELIMITER ',' CSV HEADER`))

      copyToDBStream.on('error', errorHandler)


      let timerLabel = filePath
      console.time(timerLabel)

      fs.createReadStream(filePath).on('error', errorHandler).on('error', errorHandler)
                                   .pipe(gunzipper).on('error', errorHandler)
                                   .pipe(iconv.decodeStream('iso-8859-1').on('error', errorHandler))
                                   .pipe(iconv.encodeStream('utf8').on('error', errorHandler))
                                   .pipe(copyToDBStream)
                                   .on('error', errorHandler)
                                   .on('end', () => { 
                                       done()
                                       if (!calledBack) return (calledBack = true) && delayedCb(null)
                                   })
                                   .on('finish', () => { 
                                       console.timeEnd(timerLabel)
                                       done()
                                       if (!calledBack) return (calledBack = true) && delayedCb(null)
                                   })
  })
}

const loadDataForTable = (tableName, cb) => {

  if (!dataFilesByTable[tableName]) {
    console.log("No data files for table", tableName)
    return cb(null)
  }

  let query = `SELECT DISTINCT geography FROM ${tableName} WHERE char_length(geography) = 2;`

  setTimeout(() => dbService.runQuery(query, (err, result) => {

    if (err) { 
      errorLog = (errorLog || fs.createWriteStream(errorLogPath))
      errorLog.write(`Could not query ${tableName} for uploaded states.\nerr.stack`)
      return cb(null) 
    }

    let uploadedStatesTable = result.rows.reduce((acc, row) => {
      acc[row.geography.trim()] = 1
        
      return acc
    }, {})

    // Get the .csv files that haven't yet been uploaded.
    let filesToUpload = dataFilesByTable[tableName].filter( (fileInfo) => 
      (!uploadedStatesTable[fileInfo.stateCode]) && _.includes(statesToUpload, fileInfo.stateAbbrv)
    )

    let uploadTasks = filesToUpload.map(fileInfo => uploadFile.bind(null, tableName, fileInfo.filePath))

    // We don't terminate on errors. We log them.
    async.series(uploadTasks, cb)
  }), 1500)
}

let loadTableTasks = tables.map(table => loadDataForTable.bind(null, table))

async.series(loadTableTasks, () => { 
  if (errorLog) {
    console.log(`
        Errors occurred while uploading the CSVs to Postgres. 
        Check ${errorLogPath} for details.
    `)
  }

  pg.end()
})
