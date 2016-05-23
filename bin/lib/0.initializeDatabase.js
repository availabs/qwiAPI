#!/usr/bin/env node

'use strict'

const path = require('path')
const async = require('async')
const pg = require('pg')


const projectRoot = path.join(__dirname, '../../')

const envFile = require('node-env-file')
envFile(path.join(projectRoot, 'config/postgres_db.env'))
envFile(path.join(projectRoot, 'config/qwi.env'))

const db_user   = process.env.QWI_POSTGRES_USER || ''
const db_passwd = process.env.QWI_POSTGRES_PASSWORD || ''
const port      = process.env.QWI_POSTGRES_PORT || ''
const db_name   = process.env.QWI_POSTGRES_DB
const netloc    = process.env.QWI_POSTGRES_NETLOC


const postgresPasswordPrompt = `
This script will create the ${db_name} database and the ${db_user} user.
If this database and user currently exist, _THEY_WILL_BE_DROPPED_.
To quit, press CTRL-c. 
To continue, please enter postgres user password for ${netloc}`


let connectionString

const pgStatementExecutor = (sqlStatement, cb) => 

  pg.connect(connectionString, (err, client, done) => {
    if (err) { return cb(err) }

    client.query(sqlStatement, err => {
      done()
      if (err) { return cb(err) }
      cb(null)
    })
  })


const getPostgresUserPassword = (cb) => {
  require('getpass').getPass({ prompt: postgresPasswordPrompt }, (err, passwd) => {

    if (err) { return cb(err) }

    connectionString = 
      `postgresql://postgres${passwd && (':'+passwd)}@${netloc}${port && (':'+port)}/postgres`

    console.log(connectionString)
    cb(null)
  })
}


const dropDatabase = (cb) => pgStatementExecutor(`DROP DATABASE IF EXISTS ${db_name};`, cb)
const dropUser = (cb) => pgStatementExecutor(`DROP USER IF EXISTS ${db_user};`, cb)
const createDatabase = (cb) => pgStatementExecutor(`CREATE DATABASE ${db_name};`, cb)

const createUser = (cb) => pgStatementExecutor(`
  CREATE ROLE ${db_user} ENCRYPTED PASSWORD '${db_passwd}'
    NOSUPERUSER NOCREATEDB NOCREATEROLE INHERIT LOGIN;

  /* Set user readonly */
  GRANT CONNECT ON DATABASE ${db_name} TO ${db_user};
  ALTER DATABASE ${db_name} OWNER TO ${db_user};
`, cb)


const taskChain = [
  getPostgresUserPassword,
  dropDatabase,
  dropUser,
  createDatabase,
  createUser,
]

async.series(taskChain, (err) => {
  if (err) {
    return console.error(err.message)
  } 

  pg.end()

  console.log(`Database ${db_name} and user ${db_user} were created.`)
})

/*
  GRANT USAGE ON SCHEMA public TO ${db_user};
  GRANT SELECT ON ALL TABLES IN SCHEMA public
    ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO ${db_user}; 
*/

