const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const helper = require('sendgrid').mail;
const bcrypt = require('bcrypt-nodejs');

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
          var token = jwt.sign(user, process.env.SECRET, {
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
          var token = jwt.sign(existingUser, process.env.SECRET, {
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
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
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
      var token = jwt.sign(existingUser, process.env.SECRET, {
          expiresIn : 60*60 // expires in 1 hours
          });
      email_content = "<h3>Hi "+existingUser.lastname+", </h3> <p>We have received a request to reset your password. If you did not make the request, just ignore this email.<p><p>Otherwise, you can reset your password using this temp password: "+token+".<p></br> Thanks,</br>BuildingBrains Team"
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
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.', passwordResetToken: ""});}
      else{
        console.log(decoded._doc.email);
        console.log(newPassword);
        User.findOneAndUpdate({ email: decoded._doc.email }, { $set: { password: newPassword }}, { multi: false }, (err, existingUser) => {
          if (err) {return res.json({result:1, error:error, passwordResetToken: ""})}
          else{
              var newToken = jwt.sign(existingUser, process.env.SECRET, {
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
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
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
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.'});}
      else{
        console.log(decoded._doc.email);
        User.findOneAndUpdate({ email: decoded._doc.email }, { $set: { firstname: req.body.firstName, lastname:req.body.lastName  }}, { multi: true }, (err, existingUser) => {
            console.log(existingUser);
          if (err) {return res.json({result:1, error:error})}
          else{
            var newToken = jwt.sign(existingUser, process.env.SECRET, {
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
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
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
