const User = require('../models/user')
const Hub = require('../models/hub')
const Device = require('../models/device')
const Update = require('../models/update')
const Automation = require('../models/automation')

/*
 * POST /api/automations/:hubID
 * Create a new automation
 * JSON Req: {automationName: String, devices: {Device, setting: String}}
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.postAutomation = function(req,res){}

/*
 * GET /api/automations/:hubID
 * Retrieve all of a hubs automations
 * 200 Res: {message: String, objects: Automations}
 * 400 Res: {message: String}
 */
exports.getAutomations = function(req,res){}

/*
 * DELETE /api/automations/:hubID
 * Delete an automation
 * JSON Req: {automationID: String}
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.deleteAutomation = function(req,res){}

/*
 * GET /api/automations/:automationID
 * Retrieve an automation
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.getAutomation = function(req,res){}

/*
 * PUT /api/automations/:automationID
 * Add a device to an automation
 * JSON Req: {deviceID: String, setting: String}
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.putDevice = function(req,res){}

/*
 * DELETE /api/automations/:automationID
 * Delete a device from an automation
 * JSON Req: {deviceID: String}
 * 200 Res: {message: String, object: Automation}
 * 400 Res: {message: String}
 */
exports.deleteDevice = function(req,res){}
