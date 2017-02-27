const async = require('async');
const crypto = require('crypto');
const Hub = require('../models/Hub');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/* #1
 * POST hubs/add
 * Add a hub to a user.
 * Authentication: Auth Header
 * JSON req: {hubCode: "xxx", hubName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {
  console.log("postAdd \n",req.body);

  req.assert('hubCode', 'hubCode is empty').notEmpty();
  req.assert('hubName', 'Name is empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.' });}
      else { // if everything is good
        user = decoded._doc;

        Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
          if (err) {
            return res.json({result:1, error:error});
          }

          if (existingHub) {
            User.findOne({ _id:user._id}, (err, existingUser) => {
              if (err) {
                return res.json({result:1, error:error});
              }

              if (existingUser) {
                if (existingHub.name == null) {
                  existingHub.name = req.body.hubName;
                  existingHub.save();
                }
                //This prevents duplicates
                existingUser.hubs.pull(existingHub);
                existingHub.users.pull(existingUser);

                existingUser.hubs.push(existingHub);
                existingHub.users.push(existingUser);

                existingUser.save();
                existingHub.save();

                return res.json({result:0, error:"", hub: existingHub, user: existingUser});
              }
              else{
                return res.json({result:1, error:"User could not be found, hub could not be added."});
              }
            });
          }
          else{
            return res.json({result:1, error:"A hub matching this hubCode could not be found."});
          }
        });
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }
};

 /* #2
  * POST hubs/delete
  * Delete a hub from a user.
  * Authentication: Auth Header
  * JSON req: {hubID: "xxx"}<br/>
  * JSON res: {result: 0/1, error: "xxx"}<br/>
  */
exports.postDelete = (req, res) => {
  console.log("postDelete \n",req.body);

  req.assert('hubID', 'hubID is empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.' });}
      else { // if everything is good
        user = decoded._doc;

        Hub.findOne({ _id:req.body.hubID}, (err, existingHub) => {
          if (err) {
            return res.json({result:1, error:error});
          }

          if (existingHub) {
            User.findOne({ _id:user._id}, (err, existingUser) => {
              if (err) {
                return res.json({result:1, error:error});
              }

              if (existingUser) {
                existingUser.hubs.pull(existingHub);
                existingHub.users.pull(existingUser);

                existingUser.save();
                existingHub.save();

                return res.json({result:0, error:"", hub: existingHub, user: existingUser});
              }
              else{
                return res.json({result:1, error:"User could not be found, hub could not be added."});
              }
            });
          }
          else{
            return res.json({result:1, error:"A hub matching this hubID could not be found."});
          }
        });
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }
};

/* #3
 * GET hubs/
 * Return all of users hubs
 * Authentication: Auth Header
 * JSON res: {result: 0/1, error: "xxx", hubs: {hub}}
 */
exports.getAll = (req, res) => {
  console.log("getAll \n", req.body);

  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token){
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) {return res.json({ result: 1, error: 'Failed to authenticate token.' });}
      else { // if everything is good
        user = decoded._doc;

        return res.json({ result: 0, errors: "", hubs: user.hubs})
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }

};

/* #4
 * POST hubs/register
 * THIS CALL IS ONLY FOR THE HUB
 * Sends hub information to backend,
 * address is the hubs IP address
 * hubCode is the code that hub and user have (printed on bottom of the hub)
 * JSON req: {address: "xxx", hubCode: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postRegister = (req, res) => {

  console.log("postRegister \n",req.body);

  req.assert('hubCode', 'hubCode is empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.json({result:1, error:errors});
  }

  const hub = new Hub({
    hubCode:req.body.hubCode,
    address:req.headers['ip']
  });

  Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
    if (err) {
      return res.json({result:1, error:error});
    }

    if (existingHub) {
      return res.json({result:1, error:'This Hub has already been registered'});
    }

    hub.save((err) => {
      if (err) { return next(err); }
      return res.json({result:0, error:""});
    });
  });
};
