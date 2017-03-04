/**
 * Module dependencies.
 */
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')
const logger = require('morgan')
const chalk = require('chalk')
const errorHandler = require('errorhandler')
const dotenv = require('dotenv')
const flash = require('express-flash')
const path = require('path')
const mongoose = require('mongoose')
const expressValidator = require('express-validator')
const expressStatusMonitor = require('express-status-monitor')
const assert = require('assert')

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' })

/**
 * Controllers (route handlers).
 */
const userController = require('./controllers/user')
const hubController = require('./controllers/hub')
const deviceController = require('./controllers/device')

/**
 * Create Express server.
 */
const server = express()

/**
 * Connect to MongoDB.
 */

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI)
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'))
  process.exit()
})

server.set('superSecret', process.env.SECRET)

/**
 * Express configuration.
 */
server.set('port', process.env.PORT || 3000)
server.use(expressStatusMonitor())
server.use(compression())
server.use(logger('dev'))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(expressValidator())
server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token")
  next()
})

/**
 * Primary server routes.
 */
//User
server.post('/users/signup/', userController.postSignup)
server.post('/users/login/', userController.postLogin)
server.post('/users/logout/', userController.postLogout)
server.post('/users/forgot/', userController.postForgot)
server.post('/users/reset/', userController.postReset)
server.get('/users/account/', userController.getAccount)
server.post('/users/account/profile/', userController.postUpdateProfile)
server.post('/users/account/password', userController.postUpdatePassword)
server.post('/users/account/delete/', userController.postDeleteAccount)

//Hub
server.post('/hubs/register', hubController.postRegister)
server.post('/hubs/add', hubController.postAdd)
server.post('/hubs/delete', hubController.postDelete)
server.get('/hubs/', hubController.getAll)

//Device
server.post('/devices/register', deviceController.postRegister)
server.post('/devices/nearby', deviceController.postNearby)
server.post('/devices/add', deviceController.postAdd)
server.post('/devices/', deviceController.postAll)
server.get('/devices/:deviceID', deviceController.getDevice)
server.post('/devices/update', deviceController.postUpdate)

/**
 * Error Handler.
 */
server.use(errorHandler())

/**
 * Start Express server.
 */
server.listen(server.get('port'), () => {
  console.log('%s Server is running at http://localhost:%d in %s mode', chalk.green('✓'), server.get('port'), server.get('env')) 
  console.log('  Press CTRL-C to stop\n')
})

module.exports = server
