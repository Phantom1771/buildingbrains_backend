const async = require('async')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const helper = require('sendgrid').mail
const bcrypt = require('bcrypt-nodejs')

/* #1
 * POST users/signup/
 * Create a new local account.
 * JSON Req: { email:"xxx@xxx", password:"xxx", firstname:"xxx", lastname:"xxx"}
 * JSON Res: { result: 0/1, error:"xxx", userToken:"xxx"}
 */
exports.postSignup = (req, res) => {
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password must be at least 4 characters long').len(4)
  req.sanitize('email').normalizeEmail({ remove_dots: false })

  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors})
    return
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname
  })

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      res.json({result:1, error:error})
      return
    }

    if (existingUser) {
      res.json({result:1, error:'Account with that email address already exists.'})
      return
    }
    user.save((err) => {
      if (err) { return next(err) }
      // if user is saved, create a token
          var token = jwt.sign(user, process.env.SECRET, {
          expiresIn : 60*60*24 // expires in 24 hours
          })
      res.json({result:0,error:"", userToken: token})
      return
    })
  })
}

/* #2
 * POST /users/login/
 * Sign in using email and password.
 * JSON Req: { email:"xxx@xxx", password:"xxx"}
 * JSON Res: { result: 0/1, error:"xxx", userToken: "xxx"}
 */
exports.postLogin = (req, res) => {
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password cannot be blank').notEmpty()
  req.sanitize('email').normalizeEmail({ remove_dots: false })
  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors})
    return
  }

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      res.json({result:1, error:err})
      return
    }
    if (existingUser) {
      existingUser.comparePassword(req.body.password, function(err, isMatch) {
        if (isMatch) {
          // if user is found and password is right create a token
          var token = jwt.sign(existingUser, process.env.SECRET, {
          expiresIn : 60*60*24 // expires in 24 hours
          })
          res.json({result:0, error:"", userToken: token})
          return
        }
          res.json({result:1, error:"Password incorrect!"})
          return
    })
    }
    else {
      res.json({result:1, error:"User not found!"})
      return
    }
  })
}

/* #3
 * POST /users/logout/
 * Log out.
 * Authentication: header: x-access-token
 * JSON Req: {}
 * JSON Res: { result: 0/1, error:"xxx" }
 */
exports.postLogout = (req, res) => {
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.' })
        return
      }
      else { // if everything is good, save to request for use in other routes
        res.json({ result: 0, error: '' })
        return
      }
    })
  }
  else{ // if there is no token return an error
    res.json({ result: 1, error: 'No token provided.' })
    return
  }
}

/* #4
 * POST /users/forgot/
 * Forgot password
 * JSON Req: { email:"xxx@xxx" }
 * JSON Res: { result: 0/1, error:"xxx"}
 */
exports.postForgot = (req, res) => {
  req.assert('email', 'Email is not valid').isEmail()
  const errors = req.validationErrors()

  if (errors) {
    res.json({result:1, error:errors})
    return
  }

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      res.json({result:1, error:err})
      return
    }
    if (existingUser) {
      var token = jwt.sign(existingUser, process.env.SECRET, {
          expiresIn : 60*60 // expires in 1 hours
          })
      email_content = "<h3>Hi "+existingUser.lastname+", </h3> <p>We have received a request to reset your password. If you did not make the request, just ignore this email.<p><p>Otherwise, you can reset your password using this temp password: "+token+".<p></br> Thanks,</br>BuildingBrains Team"
      from_email = new helper.Email("BuildingBrains@colorado.edu")
      to_email = new helper.Email("yang.song@colorado.edu")
      subject = "Reset your Password"
      content = new helper.Content("text/html", email_content)
      mail = new helper.Mail(from_email, subject, to_email, content)
      var sg = require('sendgrid')(process.env.SENDGRID_API_KEY)
      var request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: mail.toJSON()
      })

      sg.API(request, function(error, response) {
          console.log(response.statusCode)
          console.log(response.body)
          console.log(response.headers)
      })
      res.json({result:0, error:"Email is sent!"})
      return
    }
    else {
      res.json({result:1, error:"User not found!"})
      return
    }
  })
}

/**
 * POST /users/reset/
 * Reset password
 * Authentication: header: x-access-token
 * JSON Req: {email: "xxx@xxx", password: "xxx", passwordResetToken: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", userToken: "xxx"}
*/
exports.postReset = (req, res, next) => {

}

/**
 * GET users/account/
 * Return account info
 * Authentication: header: x-access-token
 * JSON res: {firstName: "xxx", lastName: "xxx", email: "xxx@xxx", password: "xxx", hubs:[hub]}
 */

exports.getAccount = (req, res) => {
  var token = req.headers['x-access-token']

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.' })
        return
      }
      else {
        User.findOne({ email: decoded._doc.email }, (err, existingUser) => {
          if (err) {
            res.json({result:1, error:err})
            return
          }
          if (existingUser) {
            res.json({ result: 0, error: "", email:existingUser.email, firstname:existingUser.firstname, lastname:existingUser.lastname, hubs:existingUser.hubs})
            return
          }
          else {
            res.json({result:1, error:"User not found!"})
            return
          }
        })
      }
    })
  }
  else{
    res.json({ result: 1, error: 'No token provided.' })
    return
  }
}

/**
 * POST /account/profile
 * Update profile information.
 * Authentication: header: x-access-token
 * JSON req: {firstName: "xxx", lastName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", userToken:"xxx"}
 */

exports.postUpdateProfile = (req, res, next) => {
  var token = req.headers['x-access-token']

  if(token){
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.'})
        return
      }
      else{
        User.findOneAndUpdate({ email: decoded._doc.email }, { $set: { firstname: req.body.firstName, lastname:req.body.lastName  }}, { multi: true }, (err, existingUser) => {
          if (err) {
            res.json({result:1, error:error})
            return
          }
          else{
            var newToken = jwt.sign(existingUser, process.env.SECRET, {
              expiresIn : 60*60*24 // expires in 24 hours
            })
            res.json({result:0, error:"", userToken:newToken})
            return
          }
        })
      }
    })
  }
  else{
    res.json({ result: 1, error: 'No token provided.'})
    return
  }
}

/**
 * POST users/account/password
 * Update profile information.
 * Authentication: header: x-access-token
 * JSON req: {newPassword: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", token:"xxx"}
 */
exports.postUpdatePassword = (req, res, next) => {
  var token = req.headers['x-access-token']

  //hash the newPassword
  var salt = bcrypt.genSaltSync(10)
  var newPassword = bcrypt.hashSync(req.body.newPassword, salt)

  if(token){
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.', passwordResetToken: ""})
        return
      }
      else{
        User.findOneAndUpdate({ email: decoded._doc.email }, { $set: { password: newPassword }}, { multi: false }, (err, existingUser) => {
          if (err) {
            res.json({result:1, error:error, userToken: ""})
            return
          }
          else{
              var newToken = jwt.sign(existingUser, process.env.SECRET, {
              expiresIn : 60*60*24 // expires in 24 hours
            })
            res.json({ result:0, error:"", userToken:newToken})
            return
          }
        })
      }
    })
  }
  else{
    res.json({ result: 1, error: 'No token provided.', passwordResetToken: ""})
    return
  }
}

/**
 * POST users/account/delete
 * Delete account
 * Authentication: header: x-access-token
 * JSON req: {}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postDeleteAccount = (req, res, next) => {
  var token = req.headers['x-access-token']

  if(token){
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {
        res.json({ result: 1, error: 'Failed to authenticate token.'})
        return
      }
      else{
        User.remove({ email: decoded._doc.email }, function (err) {
          if(err)  {
            res.json({ result: 1, error:err})
            return
          }
          else {
            res.json({ result: 0, error:""})
            return
          }
         })
      }
    })
  }
  else{
    res.json({ result: 1, error: 'No token provided.'})
    return
  }
}
