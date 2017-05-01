const express = require('express')
const session = require('express-session')
const expressValidator = require('express-validator')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const logger = require('morgan')
const passport = require('passport')
const ejs = require('ejs')
const chalk = require('chalk')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.load({ path: '.env' })

// Controllers
const authController = require('./controllers/auth')
const clientController = require('./controllers/client')
const oauth2Controller = require('./controllers/oauth2')

const userController = require('./controllers/user')
const hubController = require('./controllers/hub')
const deviceController = require('./controllers/device')
const groupController = require('./controllers/group')
const automationController = require('./controllers/automation')
const updateController = require('./controllers/update')


// Connect to the buildingbrainsV2 MongoDB
mongoose.connect('mongodb://localhost:27017/BuildingBrainsV2')

// Create our Express application
const app = express()

// Set view engine to ejs
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(logger('dev'))
app.use(session({
  secret: 'Super Secret Session Key',
  saveUninitialized: true,
  resave: true
}));
app.use(expressValidator())
app.use(cors())

const port = process.env.PORT || 3000
const router = express.Router()

/*
 * All Server Routes
 */

// Client Routes
router.route('api/clients')
  .post(authController.isAuthenticated, clientController.postClients)
  .get(authController.isAuthenticated, clientController.getClients)

// Oauth2 Routes
router.route('api/oauth2/authorize')
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision)
router.route('api/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token)

// User Routes
router.route('api/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers)
router.route('api/users/account')
  .get(authController.isAuthenticated, userController.getUser)
  .put(authController.isAuthenticated, userController.putUser)
  .delete(authController.isAuthenticated, userController.deleteUser)
router.route('api/users/account/forgot')
  .put(userController.putForgot)

// Hub Routes
router.route('api/hubs')
  .post(hubController.postHub)
  .get(authController.isAuthenticated, hubController.getHubs)
  .put(authController.isAuthenticated, hubController.putHub)
router.route('api/hubs/:hubID')
  .get(authController.isAuthenticated, hubController.getHub)
  .delete(authController.isAuthenticated, hubController.deleteHub)

// Device Routes
router.route('api/devices')
  .post(deviceController.postDevice)
  .put(authController.isAuthenticated, deviceController.putDevices)
router.route('api/devices/unclaimed/:hubID')
  .get(authController.isAuthenticated, deviceController.getUnclaimedDevices)
router.route('api/devices/:hubID')
  .get(authController.isAuthenticated, deviceController.getDevices)
router.route('api/devices/:deviceID')
  .get(authController.isAuthenticated, deviceController.getDevice)
  .put(authController.isAuthenticated, deviceController.putDevice)
  .delete(authController.isAuthenticated, deviceController.deleteDevice)

// Group Routes
router.route('api/groups/:hubID')
  .post(authController.isAuthenticated, groupController.postGroup)
  .get(authController.isAuthenticated, groupController.getGroups)
  .delete(authController.isAuthenticated, groupController.deleteGroup)
router.route('api/groups/:groupID')
  .get(authController.isAuthenticated, groupController.getGroup)
  .put(authController.isAuthenticated, groupController.putDevice)
  .delete(authController.isAuthenticated, groupController.deleteDevice)

// Automation Routes
router.route('api/automations/:hubID')
  .post(authController.isAuthenticated, automationController.postAutomation)
  .get(authController.isAuthenticated, automationController.getAutomations)
  .delete(authController.isAuthenticated, automationController.deleteAutomation)
router.route('api/automations/:automationID')
  .get(authController.isAuthenticated, automationController.getAutomation)
  .put(authController.isAuthenticated, automationController.putDevice)
  .delete(authController.isAuthenticated, automationController.deleteDevice)
router.route('api/automations/:automationID/send')
  .get(authController.isAuthenticated, automationController.getSend)

// Update Routes
router.route('api/updates/:hubCode')
  .get(updateController.getUpdates)

/**
 * Start Express server.
 */
app.listen(port, () => {
  console.log('%s Server is running at http://localhost:%d in %s mode', chalk.green('✓'), port, app.get('env')) 
  console.log('  Press CTRL-C to stop\n')
})

module.exports = app
