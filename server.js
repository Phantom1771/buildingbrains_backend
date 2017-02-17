


/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
//const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
//const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const config = require('./config');


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */

const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

/**
 * Create Express server.
 */
const server = express();

/**
 * Connect to MongoDB.
 */

mongoose.Promise = global.Promise;
//mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connect(config.database);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

server.set('superSecret', config.secret);

/**
 * Express configuration.
 */
server.set('port', process.env.PORT || 3000);
//server.set('views', path.join(__dirname, 'views'));
//server.set('view engine', 'pug');
server.use(expressStatusMonitor());
server.use(compression());
/*server.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));*/
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(expressValidator());
server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/**
 * Primary server routes.
 */
//User
server.post('/users/signup/', userController.postSignup);
server.post('/users/login/', userController.postLogin);
server.post('/users/logout/', userController.postLogout);

//server.get('/users/test/', userController.getTest);

server.get('/forgot', userController.getForgot);
server.post('/forgot', userController.postForgot);
server.get('/reset/:token', userController.getReset);
server.post('/reset/:token', userController.postReset);
server.get('/contact', contactController.getContact);
server.post('/contact', contactController.postContact);
/*server.get('/account', passportConfig.isAuthenticated, userController.getAccount);
server.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
server.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
server.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
server.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
*/
/**
 * API examples routes.
 */
server.get('/api', apiController.getApi);
server.get('/api/stripe', apiController.getStripe);
server.post('/api/stripe', apiController.postStripe);
server.get('/api/twilio', apiController.getTwilio);
server.post('/api/twilio', apiController.postTwilio);
server.get('/api/clockwork', apiController.getClockwork);
server.post('/api/clockwork', apiController.postClockwork);
//server.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
server.get('/api/paypal', apiController.getPayPal);
server.get('/api/paypal/success', apiController.getPayPalSuccess);
server.get('/api/paypal/cancel', apiController.getPayPalCancel);


/**
 * Error Handler.
 */
server.use(errorHandler());


/**
 * Start Express server.
 */
server.listen(server.get('port'), () => {
  console.log('%s Server is running at http://localhost:%d in %s mode', chalk.green('✓'), server.get('port'), server.get('env')); 
  console.log('  Press CTRL-C to stop\n');
});

module.exports = server;
