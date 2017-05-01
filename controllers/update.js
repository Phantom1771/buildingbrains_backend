const async = require('async')

const Update = require('../models/update')

/*
 * GET /api/updates/:hubCode
 * Create a new update
 * 200 Res: {message: String, objects: Updates}
 * 400 Res: {message: String}
 */
exports.getUpdates = function(req,res){
  Update.find({ hubCode: req.params.hubCode}, (err, existingUpdates) => {
    if (err) {
      res.status(400).json({result:1, error:err})
      return
    }

    if (existingUpdates) {
      res.status(200).json({message: 'Retrieved updates', updates: existingUpdates})
      async.each(existingUpdates, function(existingUpdate, callback) {
        Update.remove({_id: existingUpdate._id}, function(err){
          callback()
        })
      })
      return
    }
  })
 }
