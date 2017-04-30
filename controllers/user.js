const async = require('async')
const helper = require('sendgrid').mail
const User = require('../models/user')
const dotenv = require('dotenv')

dotenv.load({ path: '.env' })
const sendGrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

/*
 * POST /api/users/
 * Create a new user account
 * JSON Req: {email: String, password: String, firstName: String, lastName: String}
 * 200 Res: {message: String, object: User}
 * 400 Res: {message: String}
 */
exports.postUsers = function(req,res){
  req.assert('email', 'Email is not valid').isEmail()
  req.assert('password', 'Password must be at least 4 characters long').len(4)
  req.sanitize('email').normalizeEmail({ remove_dots: false })
  const errors = req.validationErrors()

  if (errors) {
    res.status(400).json({message: errors[0].msg})
    return
  }
  const user = new User({
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    tempPassword: false
  })
  user.save(function(err) {
    if (err){
      res.status(400).json({message: 'An account already exists with that email address.'})
      return
    }
    res.status(200).json({message: 'New user created!', object: user })
    return
  })
}

/*
 * GET /api/users/
 * Retrieve list of users
 * 200 Res: {message: String, objects: Users}
 * 400 Res: {message: String}
 */
exports.getUsers = function(req, res) {
  User.find(function(err, users) {
    if (err){
      res.status(400).json({message: err})
      return
    }
    res.status(200).json({message: 'Users Retrieved', objects: users})
    return
  })
}

/*
 * GET /api/users/account
 * Retrieve user
 * 200 Res: {message: String, objects: Users}
 * 400 Res: {message: String}
 */
 exports.getUser = function(req, res) {
   User.findOne({_id:req.user._id}, function(err, user) {
     if (err){
       res.status(400).json({message: err})
       return
     }
     res.status(200).json({message: 'User Retrieved', objects: user})
     return
   })
 }

/*
 * PUT /api/users/account
 * Update user information
 * JSON Req: {password: String, firstName: String, lastName: String}
 * 200 Res: {message: String, objects: Users}
 * 400 Res: {message: String}
 */
exports.putUser = function(req, res) {
  User.findOne({_id: req.user._id}, function(err, existingUser) {
    if (err){
      res.status(400).json({message: err})
      return
    }

    if(existingUser){
      console.log(existingUser)
      existingUser.password = req.body.password
      existingUser.firstName = req.body.firstName
      existingUser.lastName = req.body.lastName

      if(req.body.password && !existingUser.tempPassword){
        existingUser.tempPassword = false;
      }

      existingUser.save(function(err) {
        if (err){
          res.status(400).json({message: 'Could not find User'})
          return
        }

        res.status(200).json({message: 'Account updated', object: existingUser})
        return
      })
    }
  })
}

/*
 * DELETE /api/users/account
 * Delete user
 * 200 Res: {message: String}
 * 400 Res: {message: String}
 */
exports.deleteUser = function(req, res) {
  User.remove({_id: req.user._id}, function(err) {
    if (err){
      res.status(400).json({ message: err })
      return
    }

    res.status(200).json({ message: 'User removed!' })
    return
  })
}

/*
 * GET /api/users/account/forgot
 * Send user an email with temporary password
 * JSON Req: {email: String}
 * 200 Res: {message: String}
 * 400 Res: {message: String}
 */
exports.putForgot = function(req,res){
  token = uid(8)

  User.findOne({email: req.body.email}, function(err, existingUser) {
    if (err){
      res.status(400).json({message: err})
      return
    }

    if(existingUser){
      console.log(existingUser)
      existingUser.password = token
      existingUser.tempPassword = true

      existingUser.save(function(err) {
        if (err){
          res.status(400).json({message: 'Could not find User'})
          return
        }
      })
    }
  })

  var email_content = "<h3>Hello, </h3> <p>We have received a request to reset your password. If you did not make the request, just ignore this email.<p><p>Otherwise, you can reset your password using this temp password: <b>"+token+"</b>.<p></br> Thanks,</br>BuildingBrains Team"
  var from_email = new helper.Email("BuildingBrains@colorado.edu")
  var to_email = new helper.Email(req.body.email)
  var subject = "Reset your BuildingBrainsPassword"
  var content = new helper.Content("text/html", email_content)
  var mail = new helper.Mail(from_email, subject, to_email, content)

  var request = sendGrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  })

  sendGrid.API(request, function(error, response) {
    if(response.statusCode === 202){
      res.status(200).json({message: 'Email sent'})
      return
    }
    else{
      res.status(400).json({message: 'Email not sent'})
    }
  })
}

/*
 * Helper functions to create temporary password
 */
 function uid (len) {
   var buf = [],
     chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
     charlen = chars.length

   for (var i = 0; i < len; ++i) {
     buf.push(chars[getRandomInt(0, charlen - 1)])
   }

   return buf.join('')
 }

 function getRandomInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min
 }
