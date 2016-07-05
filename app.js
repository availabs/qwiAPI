"use strict"

const express = require('express')
const envFile = require('node-env-file')
envFile(__dirname + '/config/node_server.env')
envFile(__dirname + '/config/postgres_db.env')
envFile(__dirname + '/config/qwi.env')

const env = require('process').env


const app = express()


const bodyParser = require('body-parser')

const async = require('async')

const labels = require('./metadata/labels')

const parseQuery = require('./src/services/QueryParsingService').parse
const buildSQLString = require('./src/builders/SQLStringBuilder').buildSQLString

const derivedDataQueryParsingService = require('./src/services/DerivedDataQueryParsingService')

const parseMeasureRatiosByFirmageQuery = derivedDataQueryParsingService.parseMeasureRatiosByFirmageQuery
const parseInterstateMSAViewQuery = derivedDataQueryParsingService.parseInterstateMSAViewQuery

const buildDerivedDataQuerySQLString = require('./src/builders/DerivedDataQuerySQLStringBuilder').buildSQLString


const handleParsedQueryObject = require('./src/services/DBService').handleParsedQueryObject
const buildNestedResponseObject = require('./src/builders/nestedResponseObjectBuilder').build

const port = (env.PORT || 10101)


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', express.static('static'))


const handleError = (res, err) => {
  console.error(err.stack)
  res.status(500).send({ error: err.message })
}


app.get('/metadata/labels', (req, res) => {
  return res.status(200).send(labels)
})


app.get('/data/*', (req, res) => {

    let chain = [
      parseQuery.bind(null, req),
      buildSQLString,
      handleParsedQueryObject,
      buildNestedResponseObject,
    ]

    async.waterfall(chain, (err, data) => {
      if (err) {
        return handleError(res, err)
      }

      return res.status(200).send({ data: data })
    })
})



app.get('/derived-data/measure-ratios-by-firmage/*', (req, res) => {

    let chain = [
      parseMeasureRatiosByFirmageQuery.bind(null, req),
      buildDerivedDataQuerySQLString,
      handleParsedQueryObject,
      buildNestedResponseObject,
    ]

    async.waterfall(chain, (err, data) => {
      if (err) {
        return handleError(res, err)
      }

      return res.status(200).send({ data: data })
    })
})


app.get('/derived-data/interstate-msa/*', (req, res) => {

    let chain = [
      parseInterstateMSAViewQuery.bind(null, req),
      buildDerivedDataQuerySQLString,
      handleParsedQueryObject,
      buildNestedResponseObject,
    ]

    async.waterfall(chain, (err, data) => {
      if (err) {
        return handleError(res, err)
      }

      return res.status(200).send({ data: data })
    })
})



app.listen(port, function () {
    console.log('App listening on port ' + port)
})
