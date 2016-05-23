#!/usr/bin/env node
/*
  command line args:
    --states: String with states to upload. States separated by spaces.
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

const qwi_release = env.QWI_RELEASE
if (!qwi_release) {
  console.error("The QWI_RELEASE environment variable must be set in config/qwi.env")
}

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

      currentFilePath = filePath
      let fileStream = fs.createWriteStream(filePath) 

      let url = `${censusURL}/${state}/${qwi_release}/DVD-${workerC}_${firmC}/qwi_${state}_${fileName}`

      http.request(url, res => {
        res.pipe(fileStream)
          .on('finish', () => {
            currentFilePath = null
            console.log("Downloaded", fileName, 'for', state + '.')
            cb(null)
          })
          .on('error', (err) => {
            console.error('\tERROR downloading the file')
              fs.unlink(filePath, (fErr) => {
                if (fErr) {
                  console.error('\tCould not delete the file.')
                  return cb(err)
                }    
                console.error('\tThe download file has been deleted.')
              })
            cb(err)
          })
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
console.time('Download all metro files.')
async.series(scrapers, (err) => {
  console.timeEnd('Download all metro files.')

  if (err) { return console.error(err) }
})
