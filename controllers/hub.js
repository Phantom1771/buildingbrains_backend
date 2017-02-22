const async = require('async');
const crypto = require('crypto');
const Hub = require('../models/Hub');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

/* #1
 * POST hubs/add
 * Add a hub to a user.
 * Authentication: Auth Header
 * JSON req: {hubCode: "xxx", hubName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {};

 /* #2
  * POST hubs/delete
  * Delete a hub from a user.
  * Authentication: Auth Header
  * JSON req: {hubID: "xxx"}<br/>
  * JSON res: {result: 0/1, error: "xxx"}<br/>
  */
exports.postDelete = (req, res) => {};

/* #3
 * POST hubs/register
 * THIS CALL IS ONLY FOR THE HUB
 * Sends hub information to backend
 * JSON req: {address: "xxx", hubCode: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postRegister = (req, res) => {};
