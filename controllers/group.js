const async = require('async')
const crypto = require('crypto')
const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

/* 1.
 * POST /groups/add
 * Add a Group to a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupName: "xxx", groupType: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postAdd = (req, res) => {}

/* 2.
 * POST /groups/
 * Get all Groups on a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", groups: {group}}
 */
exports.postAll = (req, res) => {}

/* 3.
 * POST /groups/addDevice
 * Add a Device to a Groups
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAddDevice = (req, res) => {}

/* 4.
 * GET /groups/:groupID
 * Get a list of all Devices in a Group
 * Authentication: Header x-access-token
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.getGroup = (req, res) => {}

/* 5.
 * POST /groups/removeDevice
 * Remove a Device from a Group
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postRemoveDevice = (req, res) => {}

/* 6.
 * POST /groups/delete
 * Delete a Group from a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", groupID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postDelete = (req, res) => {}
