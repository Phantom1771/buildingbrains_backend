const User = require('../models/user')
const Hub = require('../models/hub')
const Device = require('../models/device')
const Group = require('../models/group')

/*
 * POST /api/groups/:hubID
 * Create a new group
 * JSON Req: {groupName: String, groupType: String}
 * 200 Res: {message: String, object: Group}
 * 400 Res: {message: String}
 */
exports.postGroup = function(req,res){
  req.assert('groupName', 'groupName is empty').notEmpty()
  req.assert('groupType', 'groupType is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
   res.status(400).json({message:errors[0].msg})
   return
  }

  Hub.findOne({_id: req.params.hubID}, (err, existingHub) => {
    if (err) {
     res.status(400).json({message:error})
     return
    }
    if (existingHub){
     const group = new Group({
       name: req.body.groupName,
       type: req.body.groupType,
       hub: req.params.hubID
     })
     existingHub.groups.pull(group)
     existingHub.groups.push(group)
     existingHub.save()
     group.save((err) => {
       if (err) {
         res.status(400).json({message:"A hub matching this hubID could not be found"})
         return
       }
       res.status(200).json({message:'Group Created', object: group})
       return
     })
    }
  })
}

/*
 * GET /api/groups/:hubID
 * Retrieve all of a hubs groups
 * 200 Res: {message: String, objects: Groups}
 * 400 Res: {message: String}
 */
exports.getGroups = function(req,res){
  Group.find({ hub: req.params.hubID}, (err, existingGroups) => {
    if (err) {
      res.status(400).json({message: "Hub not found"})
      return
    }
    if (existingGroups){
      res.json({message: "", objects: existingGroups})
      return
    }
  })
}

/*
 * DELETE /api/groups/:hubID
 * Delete a group
 * JSON Req: {groupID: String}
 * 200 Res: {message: String, object: Hub}
 * 400 Res: {message: String}
 */
exports.deleteGroup = function(req,res){
  req.assert('groupID', 'groupID is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
   res.status(400).json({message:errors[0].msg})
   return
  }

  Hub.findOne({_id: req.params.hubID, groups: req.body.groupID}, (err, existingHub) => {
    if (err) {
      res.status(400).json({message: err})
      return
    }

    if (existingHub){
     //Remove reference to group
     existingHub.groups.pull(req.body.groupID)
     existingHub.save()

     //Remove Group from server
     Group.remove({_id: req.body.groupID}, function(err) {
       if(err){
         res.status(400).json({message:"A hub matching this hubID with a group matching groupID could not be found."})
         return
       }
       else{
         res.status(200).json({message:'Group Removed', object: existingHub})
         return
       }
     })
    }
  })
}

/*
 * GET /api/groups/:groupID
 * Retrieve group info
 * 200 Res: {message: String, object: Group}
 * 400 Res: {message: String}
 */
exports.getGroup = function(req,res){
  Group.findOne({ _id: req.params.groupID}, (err, existingGroup) => {
    if(err){
      res.status(400).json({message: "Group not found"})
      return
    }
    if (existingGroup){
        res.json({message: 'Group retrieved', object: existingGroup})
    }
  })
}

/*
 * PUT /api/groups/:groupID
 * Add or Remove a device from a group
 * JSON Req: {deviceID: String}
 * 200 Res: {message: String, object: Group}
 * 400 Res: {message: String}
 */
exports.putDevice = function(req,res){
  req.assert('deviceID', 'deviceID is empty').notEmpty()
  const errors = req.validationErrors()
  if (errors) {
    res.status(400).json({message:errors[0].msg})
    return
  }

  Group.findOne({_id: req.params.groupID}, (err, existingGroup) => {
    if (err) {
      res.status(400).json({message:err})
      return
    }

    if (existingGroup){
      existingGroup.devices.pull(req.body.deviceID)
      existingGroup.devices.push(req.body.deviceID)
      existingGroup.save((err) => {
        if (err) {
          res.status(400).json({message:"A group matching this groupID could not be found"})
          return
        }
        res.status(200).json({message:'Device Added', object: existingGroup})
        return
      })
    }
  })
}


/*
 * DELETE /api/groups/:groupID
 * Delete a group
 * JSON Req: {groupID: String}
 * 200 Res: {message: String, object: Device}
 * 400 Res: {message: String}
 */
 exports.deleteDevice = function(req,res){
   req.assert('deviceID', 'deviceID is empty').notEmpty()
   const errors = req.validationErrors()
   if (errors) {
     res.status(400).json({message:errors[0].msg})
     return
   }

  Group.findOne({_id: req.params.groupID}, (err, existingGroup) => {
    if (err) {
      res.status(400).json({message:err})
      return
    }

    if (existingGroup){
      existingGroup.devices.pull(req.body.deviceID)
      existingGroup.save((err) => {
        if (err) {
          res.status(400).json({message:"A group matching this groupID could not be found"})
          return
        }
        res.status(200).json({message:'Device Removed', object: existingGroup})
        return
      })
    }
  })
}
