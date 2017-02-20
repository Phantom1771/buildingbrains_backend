const async = require('async');
const crypto = require('crypto');
const Device = require('../models/Device');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/* #1
 * POST devices/add
 * Add a device to a hub.
 * JSON Req: {hubName: "xxx", deviceAddress: "xxx", deviceName: "xxx", userToken: "xxx"}
 * JSON Res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {};

/* #2
 * POST devices/update
 * update a device that already exists on a hub.
 * JSON Req: {hubName: "xxx", deviceName: "xxx", deviceSettings: {settings}, userToken: "xxx"}
 * JSON Res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {};

 /* #3
  * POST devices/delete
  * Delete a device from a hub.
  * JSON Req: {deviceName: "xxx", userToken: "xxx"}
  * JSON Res: {result: 0/1, error: "xxx"}
  */
exports.postDelete = (req, res) => {};
