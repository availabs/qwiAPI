#!/usr/bin/env node
/*
  command line args:
    --states: String with states to upload. States separated by spaces.
    --release: QWI release to pull from. (Overrides value in config/qwi.env)
*/


'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')

const mkdirp = require('mkdirp')
const async = require('async')
const _ = require('lodash')

const argv = require('minimist')(process.argv.slice(2))

const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/qwi.env'))
const env = process.env

let qwi_release = argv.release || env.QWI_RELEASE
if (!qwi_release) {
  console.error("The QWI_RELEASE environment variable must be set in config/qwi.env")
}
qwi_release = qwi_release.trim()

const dataDir = path.join(projectRoot, `data/metros_${qwi_release}`)
mkdirp.sync(dataDir)

const stateAbbrvToCode = require(path.join(projectRoot, 'metadata/geographic/stateAbbreviationToCode'))
const states = (argv.states) ? argv.states.toLowerCase().split(' ') : _.keys(stateAbbrvToCode) 

console.log('\n\nstates:', states, '\n\n')

const demoCategories = ['sa', 'se', 'rh']
const firmCategories = ['fa', 'fs']

const censusURL = "http://lehd.ces.census.gov/pub"
const aggregation = 'gm_ns_op_u'


// Delete any partially downloaded file
process.on('SIGINT', () => {
    if (currentFilePath !== null) {
      console.log("\nCaught interrupt signal. Deleting the partially downloaded file.")
      fs.unlinkSync(currentFilePath)
    }
    
    process.exit(1)
})

let currentFilePath = null


let filesWhereErrorEncountered = []
let pullTheData = (state, workerC, firmC, cb) => {

    let tableName = `${workerC}_${firmC}_${aggregation}`
    let fileName  = `${tableName}.csv.gz`
    let filePath  = path.join(dataDir, `${state}_${fileName}`)

    fs.stat(filePath, (err, stats) => {
      if (err && (err.code !== 'ENOENT')) { 
        return cb(err) 
      } 

      if (stats && stats.isFile()) {
        return cb(null)
      }

      let url = `${censusURL}/${state}/${qwi_release}/DVD-${workerC}_${firmC}/qwi_${state}_${fileName}`

      let timerLabel = `Downloaded ${fileName} for ${state}`
      console.time(timerLabel)

      return http.request(url, res => {
        if (res.statusCode === 200) {

          currentFilePath = filePath
          let fileStream = fs.createWriteStream(filePath) 

          res.pipe(fileStream)
             .on('finish', () => {
               currentFilePath = null
               console.timeEnd(timerLabel)
               cb(null)
             })
             .on('error', () => {
               filesWhereErrorEncountered.push(filePath)
               console.timeEnd(timerLabel)
               console.error('\tERROR downloading the file.')
               return fs.unlink(filePath, (fErr) => {
                 if (fErr) {
                   console.error('\tCould not delete the file.')
                   console.error(fErr.stack)
                 } else {
                   console.error('\tThe download file has been deleted.')
                 }   
                 return cb(null) // async.series should continue despite error with a single file.
               })
             })
        } else {
          filesWhereErrorEncountered.push(filePath)
          console.timeEnd(timerLabel)
          console.error(`\tERROR: a status code of ${res.statusCode} was received.`)
          cb(null) // async.series should continue despite error with a single file.
        }
       }).end()
    }) 
}


const scrapers = _.flatMapDeep(states, s => _.map(demoCategories, d => _.map(firmCategories, f => 
  pullTheData.bind(null, s, d, f)
)))


console.log(`
NOTE: Downloading the QWI data to ${dataDir}. 
      It will be safe to delete that directory after the data is uploaded to Postgres.
      The pullDataFromCensusBureau script skips files already in that directory.
`)


async.series(scrapers, () => {
  if (filesWhereErrorEncountered.length) { 
    console.error("Errors were encountered while downloading the following files:\n", 
                  JSON.stringify(filesWhereErrorEncountered, null, 4))
  }
})
