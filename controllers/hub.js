const async = require('async');
const crypto = require('crypto');
const Hub = require('../models/Hub');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/* #1
 * POST hubs/add
 * Add a hub to a user.
 * JSON Req: {hubCode: "xxx", hubName: "xxx", userToken: "xxx"}
 * JSON Res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {};


 /* #2
  * POST hubs/delete
  * Delete a hub from a user.
  * JSON Req: {hubName: "xxx", userToken: "xxx"}
  * JSON Res: {result: 0/1, error: "xxx"}
  */
exports.postDelete = (req, res) => {};
