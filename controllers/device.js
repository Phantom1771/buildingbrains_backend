const async = require('async');
const crypto = require('crypto');
const User = require('../models/User');
const Hub = require('../models/Hub');
const Device = require('../models/Device');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/* 1.
 * GET devices/
 * Return all of users devices
 * Authentication: Auth Header
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.getAll = (req, res) => {};

/* 2.
 * GET devices/deviceID
 * Return status of device
 * Authentication: Auth Header
 * JSON res: {result: 0/1, error: "xxx", device: {device}}
 */
exports.getDevice = (req, res) => {};

/* 3.
 * POST devices/nearby
 * Returns list of unregistered nearby devices
 * Authentication: Auth Header
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.postNearby = (req, res) => {
  console.log("postNearby \n",req.body);

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
            res.json({result: 1, error: "Hub not found"})
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
 * Authentication: Auth Header
 * JSON req: {hubID: "xxx", deviceID: "xxx", deviceName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postAdd = (req, res) => {
   console.log("postAdd \n",req.body);

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

         Device.findOne({_id: req.body.deviceID}, (err, existingDevice) => {
           if (err) {
             return res.json({result:1, error:error});
           }

           if (existingDevice){
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

                 return res.json({result:0, error:"", hub: existingHub});
               }
               else{
                 return res.json({result:1, error:"A hub matching this hubCode could not be found."});
               }
             });
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
 * Authentication: Auth Header
 * JSON req: {hubID: "xxx", deviceID: "xxx", deviceSettings: {settings}}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postUpdate = (req, res) => {};

/* 6.
 * POST devices/delete
 * Delete device from a users hub
 * Authentication: Auth Header
 * JSON req: {hubID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postDelete = (req, res) => {};

 /* 7.
  * POST devices/register
  * THIS CALL IS ONLY FOR THE HUB
  * Sends device information to backend,
  * deviceLink is the devices link relative to the hub
  * JSON req: {deviceLink: "xxx", hubCode: "xxx"}
  * JSON res: {result: 0/1, error: "xxx"}
  */
  exports.postRegister = (req, res) => {

    console.log("postRegister \n",req.body);

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
