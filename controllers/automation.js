const async = require('async')
const crypto = require('crypto')
const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')
const Automation = require('../models/Automation')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

/* 1.
 * POST /automations/add
 * Add Automation
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAdd = (req, res) => {}

/* 2.
 * POST /automations/
 * Get all Automations on a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx", automations: {automation}}
 */
exports.postAll = (req, res) => {}

/* 3.
 * POST /automations/addDevice
 * Add a Device and settings to an Automation
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postAddDevice = (req, res) => {}

/* 4.
 * GET /automations/:automationID
 * Get all Devices and settings in an Automation
 * Authentication: Header x-access-token
 * JSON res: {result: 0/1, error: "xxx", devices: {device, setting}}
 */
 exports.getAutomation = (req, res) => {}

/* 5.
 * POST /automations/removeDevice
 * Remove a Device and its settings from an Automation
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationID: "xxx", deviceID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postRemoveDevice = (req, res) => {}

/* 6.
 * POST /automations/delete
 * Delete an Automation from a Hub
 * Authentication: Header x-access-token
 * JSON req: {hubID: "xxx", automationID: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
exports.postDelete = (req, res) => {}
