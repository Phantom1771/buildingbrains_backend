const async = require('async');
const crypto = require('crypto');
const User = require('../models/User');
const Hub = require('../models/Hub');
const Device = require('../models/Device');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const request = require('request');

/* 1.
 * POST devices/
 * Return all of users devices on a hub
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.postAll = (req, res) => {
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

        Device.find({ hub: req.body.hubID, registered: true}, (err, existingDevices) => {
          if (existingDevices){
            for(var i=0; i < existingDevices.length; i++){
              Device.findOne({ _id: existingDevices[i]._id}, (err, existingDevice) => {
                request.get(existingDevice.link, function(err, response, body) {
                  console.log(JSON.parse(body).state);
                  existingDevice.state = JSON.parse(body).state;
                  existingDevice.save((err) => {
                    if (err) { return res.json({result:1, error:err}); }
                  });
                  console.log(existingDevice);
                });
              });
            }
            res.json({result: 0, error: "", devices: existingDevices});
          }
          else{
            res.json({result: 1, error: "Hub not found"});
          }
        });
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }
};

/* 2.
 * GET devices/deviceID
 * Return status of device
 * Authentication: header: x-access-token
 * JSON res: {result: 0/1, error: "xxx", device: {device}}
 */
exports.getDevice = (req, res) => {
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

        Device.findOne({ _id: req.params.deviceID}, (err, existingDevice) => {
          if (existingDevice){
            request.get(existingDevice.link, function(err, response, body) {
              existingDevice.state = JSON.parse(body).state;

              existingDevice.save((err) => {
                if (err) { return res.json({result:1, error:err}); }
                return res.json({result:0, error:"", devices: existingDevice});
              });
            });
          }
          else{
            res.json({result: 1, error: "Device not found"});
          }
        });
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }
};

/* 3.
 * POST devices/nearby
 * Returns list of unregistered nearby devices
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.postNearby = (req, res) => {
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

        Device.find({ hub: req.body.hubID, registered: false}, (err, existingDevices) => {
          if (existingDevices){
            res.json({result: 0, error: "", devices: existingDevices})
          }
          else{
            res.json({result: 1, error: "Hub not found"});
          }
        });
      }
    });
  }
  else{ // if there is no token return an error
    return res.json({ result: 1, error: 'No token provided.' });
  }
};

/* 4.
 * POST devices/add
 * Adds a device to a users hub
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx", deviceID: "xxx", deviceName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postAdd = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty();
   req.assert('deviceID', 'deviceID is empty').notEmpty();
   req.assert('deviceName', 'deviceName is empty').notEmpty();

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

         Device.findOne({_id: req.body.deviceID, registered: false}, (err, existingDevice) => {
           if (err) {
             return res.json({result:1, error:error});
           }

           if (existingDevice){
             //Update device info
             request.get(existingDevice.link, function(err, response, body) {
               console.log(body);
               existingDevice.state = JSON.parse(body).state;
               existingDevice.category = JSON.parse(body).category;
               existingDevice.type = JSON.parse(body).type;

               if(existingDevice.type == "Switch"){
                 existingDevice.params = ["on","off"];
               }
               else if(existingDevice.type == "Dimmer"){
                 existingDevice.params = ["percent"];
               }
               else if(existingDevice.type == "Color"){
                 existingDevice.params = ["float,float,float"]
               }
               else if(existingDevice.type == "Number"){
                 existingDevice.params = ["float"];
               }
               else if(existingDevice.type == "Contact"){
                 existingDevice.params = ["open", "closed"];
               }
               else{
                 existingDevice.params = [];
               }

               existingDevice.save((err) => {
                 if (err) { return res.json({result:1, error:err}); }
               });
             });
            //Then add to hub
             Hub.findOne({ _id:req.body.hubID}, (err, existingHub) => {
               if (err) {
                 return res.json({result:1, error:error});
               }

               if (existingHub) {
                 if (existingDevice.name == null) {
                   existingDevice.name = req.body.deviceName;
                   existingDevice.registered = true;
                   existingDevice.save();
                 }
                 //This gets rid of ducplicates
                 existingHub.devices.pull(existingDevice);
                 existingHub.devices.push(existingDevice);

                 existingHub.save();

                 return res.json({result:0, error:""});
               }
               else{
                 return res.json({result:1, error:"A hub matching this hubID could not be found."});
               }
             });
           }
           else{
             return res.json({result:1, error:"A device matching this deviceID could not be found or is already registered to a Hub."});
           }
         });
       }
     });
   }
   else{ // if there is no token return an error
     return res.json({ result: 1, error: 'No token provided.' });
   }
 };

/* 5.
 * POST devices/update
 * Updates the device status
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx", deviceID: "xxx", deviceSettings: {settings}}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postUpdate = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty();
   req.assert('deviceID', 'deviceID is empty').notEmpty();

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

         Device.findOne({ _id: req.body.deviceID, hub: req.body.hubID}, (err, existingDevice) => {
           if (existingDevice){
             request.post({url:existingDevice.link, body:req.body.deviceSettings}, function(err, response, body) {
               if(body){
                 res.json({result: 1, error: err});
                 console.log(body);
               }
               console.log(body);
             });
             res.json({result: 0, error: "", devices: existingDevice})
           }
           else{
             res.json({result: 1, error: "Device not found or isnt registered to this hub"});
           }
         });
       }
     });
   }
   else{ // if there is no token return an error
     return res.json({ result: 1, error: 'No token provided.' });
   }
 };

/* 6.
 * POST devices/delete
 * Delete device from a users hub
 * Authentication: header: x-access-token
 * JSON req: {hubID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postDelete = (req, res) => {
   req.assert('hubID', 'hubID is empty').notEmpty();
   req.assert('deviceID', 'deviceID is empty').notEmpty();

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

         Device.findOne({_id: req.body.deviceID}, (err, existingDevice) => {
           if (err) {
             return res.json({result:1, error:error});
           }

           if (existingDevice){
            //Then add to hub
             Hub.findOne({ _id:req.body.hubID}, (err, existingHub) => {
               if (err) {
                 return res.json({result:1, error:error});
               }

               if (existingHub) {
                 existingHub.devices.pull(existingDevice);

                 existingHub.save();

                 return res.json({result:0, error:""});
               }
               else{
                 return res.json({result:1, error:"A hub matching this hubID could not be found."});
               }
             });
           }
           else{
             return res.json({result:1, error:"A device matching this deviceID could not be found."});
           }
         });
       }
     });
   }
   else{ // if there is no token return an error
     return res.json({ result: 1, error: 'No token provided.' });
   }
 };


 /* 7.
  * POST devices/register
  * THIS CALL IS ONLY FOR THE HUB
  * Sends device information to backend,
  * deviceLink is the devices link relative to the hub
  * JSON req: {deviceLink: "xxx", hubCode: "xxx"}
  * JSON res: {result: 0/1, error: "xxx"}
  */
  exports.postRegister = (req, res) => {
    req.assert('deviceLink', 'deviceLink is empty').notEmpty();
    req.assert('hubCode', 'hubCode is empty').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      return res.json({result:1, error:errors});
    }

    Hub.findOne({ hubCode:req.body.hubCode}, (err, existingHub) => {
      if (err) {
        return res.json({result:1, error:error});
      }

      if (existingHub) {
        const device = new Device({
          link:req.body.deviceLink,
          hub: existingHub._id,
          registered: false
        });

        device.save((err) => {
          if (err) { return res.json({result:1, error:err}); }
          return res.json({result:0, error:""});
        });
      }
      else{
        return res.json({result:1, error:'Device already registered'})
      }
    });
  };
