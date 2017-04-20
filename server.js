const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const ejs = require('ejs')
const session = require('express-session')

// Controllers
const authController = require('./controllers/auth')
const clientController = require('./controllers/client')
const oauth2Controller = require('./controllers/oauth2')
const userController = require('./controllers/user')
const hubController = require('./controllers/hub')


// Connect to the buildingbrainsV2 MongoDB
mongoose.connect('mongodb://localhost:27017/BuildingBrainsV2')

// Create our Express application
const app = express()

// Set view engine to ejs
app.set('view engine', 'ejs')

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}))

// Use express session support since OAuth2orize requires it
app.use(session({
  secret: 'Super Secret Session Key',
  saveUninitialized: true,
  resave: true
}));

// Use environment defined port or 3000
const port = process.env.PORT || 3000

// Create our Express router
const router = express.Router()

// All Server Routes
// Client Routes
router.route('/clients')
  .post(authController.isAuthenticated, clientController.postClients)
  .get(authController.isAuthenticated, clientController.getClients)

// Oauth2 Routes
router.route('/oauth2/authorize')
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision)
router.route('/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token)

// User Routes
router.route('/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers)

// Hub Routes
router.route('/hubs')
  .post(authController.isAuthenticated, hubController.postHubs)
  .get(authController.isAuthenticated, hubController.getHubs)
router.route('/hubs/:hubID')
  .get(authController.isAuthenticated, hubController.getHub)
  .put(authController.isAuthenticated, hubController.putHub)
  .delete(authController.isAuthenticated, hubController.deleteHub)

// Register all our routes with /api
app.use('/api', router)

// Start the server
app.listen(port)
console.log('Server started on port: ' + port)
