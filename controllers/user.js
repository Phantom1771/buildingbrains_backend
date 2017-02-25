const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
var helper = require('sendgrid').mail;
const config = require('../config');
const bcrypt = require('bcrypt-nodejs');


exports.getTest = (req, res) => {
  res.json({Note:"Welcome BuildingBrain Team, Please use Restful API!"});
};
/* #1
 * POST users/signup/
 * Create a new local account.
 * JSON Req: { email:"xxx@xxx", password:"xxx", firstname:"xxx", lastname:"xxx"}
 * JSON Res: { result: 0/1, error:"xxx", userToken:"xxx"}
 */
exports.postSignup = (req, res) => {

  console.log("postSignup \n",req.body);

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname:req.body.lastname
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return res.json({result:1, error:error});
    }

    if (existingUser) {
      return res.json({result:1, error:'Account with that email address already exists.'});
    }

    user.save((err) => {
      if (err) { return next(err); }
      // if user is saved, create a token
          var token = jwt.sign(user, config.secret, {
          expiresIn : 60*60*24 // expires in 24 hours
          });
      return res.json({result:0,error:"", token});
    });
  });
};

/* #2
 * POST /users/login/
 * Sign in using email and password.
 * JSON Req: { email:"xxx@xxx", password:"xxx"}
 * JSON Res: { result: 0/1, error:"xxx", userToken: "xxx"}
 */
exports.postLogin = (req, res) => {

  console.log("postLogin \n",req.body);

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });
  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return res.json({result:1, error:err});
    }
    if (existingUser) {
      existingUser.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch) {
          // if user is found and password is right create a token
          var token = jwt.sign(existingUser, config.secret, {
          expiresIn : 60*60*24 // expires in 24 hours
          });
          return res.json({result:0, error:"", usertoken: token});
        }
          return res.json({result:1, error:"Password incorrect!"});
    });
    }
    else return res.json({result:1, error:"User not found!"});
  });
};

/* #3 
 * POST /users/logout/
 * Log out.
 * JSON Req: { userToken:"xxx" }
 * JSON Res: { result: 0/1, error:"xxx" }
 */
exports.postLogout = (req, res) => {

  console.log("postLogout \n",req.body);
  // check header or url parameters or post parameters for token
  var token = req.body.userToken || req.query.userToken || req.headers['x-access-token'];
  
  if(token){
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.' });} 
      else { // if everything is good, save to request for use in other routes
        console.log(decoded._doc.email);
        //req.decoded = decoded;
        return res.json({ result: 0, error: '' });
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }
};

/* #4
 * POST /users/forgot/
 * Forgot password
 * JSON Req: { email:"xxx@xxx" }
 * JSON Res: { result: 0/1, error:"xxx"}
 */
exports.postForgot = (req, res) => {

  console.log("postForgot \n",req.body);

  req.assert('email', 'Email is not valid').isEmail();
  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return res.json({result:1, error:err});
    }
    if (existingUser) {
      email_content = "<h3>Hi "+existingUser.lastname+", </h3> <p>We have received a request to reset your password. If you did not make the request, just ignore this email.<p><p>Otherwise, you can reset your password using this link: <a> http://127.0.0.1:3000/</a>.<p></br> Thanks,</br>BuildingBrains Team"
      from_email = new helper.Email("BuildingBrains@colorado.edu");
      to_email = new helper.Email("yang.song@colorado.edu");
      subject = "Reset your Password";
      content = new helper.Content("text/html", email_content);
      mail = new helper.Mail(from_email, subject, to_email, content);
      var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
      var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON()
      });

      sg.API(request, function(error, response) {
          console.log(response.statusCode);
          console.log(response.body);
          console.log(response.headers);
      })
      return res.json({result:0, error:"Email is sent!"});
    }
    else return res.json({result:1, error:"User not found!"});
  });
};




/**
 * POST /users/reset/
 * Reset password
 * JSON Req: {newPassword:"xxx",usertoken:"xxx"}
 * JSON res: {result: 0/1, error: "xxx", passwordResetToken: "xxx"}
*/
exports.postReset = (req, res, next) => {

  console.log("postReset \n",req.body);

  var token = req.body.userToken || req.query.userToken || req.headers['x-access-token'];

  //hash the newPassword
  var salt = bcrypt.genSaltSync(10);
  var newPassword = bcrypt.hashSync(req.body.newPassword, salt);

  if(token){
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.', passwordResetToken: ""});} 
      else{
        console.log(decoded._doc.email);
        console.log(newPassword);
        User.findOneAndUpdate({ email: decoded._doc.email }, { $set: { password: newPassword }}, { multi: false }, (err, existingUser) => {
          if (err) {return res.json({result:1, error:error, passwordResetToken: ""})}
          else{
              var newToken = jwt.sign(existingUser, config.secret, {
              expiresIn : 60*60*24 // expires in 24 hours
            });
            return res.json({ result:0, error:"", passwordResetToken:newToken});
          }
        });
      }
    });
    //return res.json({ result: 1, error:"Token error", passwordResetToken:""});
  }
  else{return res.json({ result: 1, error: 'No token provided.', passwordResetToken: ""});}
};

/**
 * POST users/account/
 * Return account info
 * JSON req: {userToken: "xxx"}
 * JSON res: {firstName: "xxx", lastName: "xxx", email: "xxx@xxx", password: "xxx", hubs:[hub]}
 */

exports.postAccount = (req, res) => {

  console.log("postAccount \n",req.body);
  var token = req.body.userToken || req.query.userToken || req.headers['x-access-token'];

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.' });} 
      else { 
        console.log(decoded._doc.email);
        User.findOne({ email: decoded._doc.email }, (err, existingUser) => {
          if (err) {return res.json({result:1, error:err});}
          console.log(existingUser);
          if (existingUser) {
            return res.json({ result: 0, email:existingUser.email, firstname:existingUser.firstname, lastname:existingUser.lastname, hubs:existingUser.hubs});
          }
          else {return res.json({result:1, error:"User not found!"});}
        });
      }
    });
  }
  else{ return res.json({ result: 1, error: 'No token provided.' });}
};

/**
 * POST /account/profile
 * Update profile information.
 * JSON req: {firstName: "xxx", lastName: "xxx", userToken: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", token:"xxx"}
 */

exports.postUpdateProfile = (req, res, next) => {
  
  console.log("postUpdateProfile \n",req.body);

  var token = req.body.userToken || req.query.userToken || req.headers['x-access-token'];

  if(token){
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.'});} 
      else{
        console.log(decoded._doc.email);
        User.findOneAndUpdate({ email: decoded._doc.email }, { $set: { firstname: req.body.firstName, lastname:req.body.lastName  }}, { multi: true }, (err, existingUser) => {
            console.log(existingUser);
          if (err) {return res.json({result:1, error:error})}
          else{
            var newToken = jwt.sign(existingUser, config.secret, {
              expiresIn : 60*60*24 // expires in 24 hours
            });
            return res.json({result:0, error:"",token:newToken});
          }
        });
      }
    });
    //return res.json({ result: 1, error:"Token error", passwordResetToken:""});
  }
  else{return res.json({ result: 1, error: 'No token provided.'});}
};

/**
 * POST users/account/delete
 * Delete account
 * JSON req: {userToken: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postDeleteAccount = (req, res, next) => {
  
  console.log("postDeleteAccount \n",req.body);

  var token = req.body.userToken || req.query.userToken || req.headers['x-access-token'];

  if(token){
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.'});} 
      else{
        console.log(decoded._doc.email);
        User.remove({ email: decoded._doc.email }, function (err) {
          if(err)  {return res.json({ result: 1, error:err});}
          else     {return res.json({ result: 0, error:""});}
          // removed!
         });
      }
    });
    //return res.json({ result: 1, error:"Token error", passwordResetToken:""});
  }
  else{return res.json({ result: 1, error: 'No token provided.'});}
};

/**
 * POST /account/delete
 * Delete user account.
 
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.

exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function resetPassword(done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    return 
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 *==
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function createRandomToken(done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function setRandomToken(token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};*/
