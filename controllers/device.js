const async = require('async');
const crypto = require('crypto');
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
 * GET devices/nearby
 * Returns list of unregistered nearby devices
 * Authentication: Auth Header
 * JSON res: {result: 0/1, error: "xxx", devices: {device}}
 */
exports.getNearby = (req, res) => {};

/* 4.
 * POST devices/add
 * Adds a device to a users hub
 * Authentication: Auth Header
 * JSON req: {hubID: "xxx", deviceLink: "xxx", deviceName: "xxx"}
 * JSON res: {result: 0/1, error: "xxx"}
 */
 exports.postAdd = (req, res) => {};

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
