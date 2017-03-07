const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')
const Group = require('../models/Group')

chai.use(chaiHttp)

var userToken = ""
var hubCode1 = "testHubCode1"
var hubCode2 = "testHubCode2"
var hubID1 = ""
var hubID2 = ""
var deviceID1 = ""
var deviceID2 = ""
var groupID = ""

describe('Create/Login/Logout User', () => {
  before((done) => {
    User.remove({}, (err) => {
       done()
    })
  })

  it('should create a new User', (done) => {
    let req = {
      email: "test@test.com",
      password: "testPass",
      firstname: "test",
      lastname: "testing"
    }
    chai.request(server)
      .post('/users/signup')
      .send(req)
      .end((err, res) => {
         res.should.have.status(200)
         res.body.should.be.a('object')
         res.body.should.have.property('result').eql(0)
         res.body.should.have.property('error').eql("")
         res.body.should.have.property('userToken')
         userToken = res.body.userToken
         done()
      })
   })

   it('should update User password', (done) => {
     let req = {
       newPassword: "testPassNew"
     }
     chai.request(server)
      .post('/users/account/password')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('userToken')
        userToken = res.body.userToken
        done()
      })
   })

   it('should logout a User', (done) => {
     let req = {}
     chai.request(server)
       .post('/users/logout')
       .set('x-access-token', userToken)
       .send(req)
       .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('result').eql(0)
          done()
       })
   })
   it('should not login a User with old password', (done) => {
     let req = {
       email: "test@test.com",
       password: "testPass"
     }
     chai.request(server)
       .post('/users/login')
       .set('x-access-token', userToken)
       .send(req)
       .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('result').eql(1)
          res.body.should.have.property('error')
          done()
       })
   })

   it('should login a User', (done) => {
     let req = {
       email: "test@test.com",
       password: "testPassNew"
     }
     chai.request(server)
       .post('/users/login')
       .set('x-access-token', userToken)
       .send(req)
       .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('result').eql(0)
          res.body.should.have.property('error')
          done()
       })
   })

   it('should get User info', (done) => {
     chai.request(server)
      .get('/users/account')
      .set('x-access-token', userToken)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('firstname').eql('test')
        res.body.should.have.property('lastname').eql('testing')
        res.body.should.have.property('email').eql('test@test.com')
        res.body.should.have.property('hubs')
        done()
      })
   })
   it('should update User info', (done) => {
     let req = {
       firstName: "testing",
       lastName: "testing"
     }
     chai.request(server)
      .post('/users/account/profile')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('userToken')
        userToken = res.body.userToken
        done()
      })
   })
   it('should get Users updated info', (done) => {
     chai.request(server)
      .get('/users/account')
      .set('x-access-token', userToken)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('firstname').eql('testing')
        res.body.should.have.property('lastname').eql('testing')
        res.body.should.have.property('email').eql('test@test.com')
        res.body.should.have.property('hubs')
        done()
      })
   })
})

describe('Register/Add/GetAll/Delete Hub', () => {
  before((done) => {
    Hub.remove({}, (err) => {
       done()
    })
  })
  //Register 2 Hubs
  it('should register a new Hub with the server', (done) => {
    let req = {
      address: "http://demo.openhab.org:8080/rest/",
      hubCode: hubCode1
    }
    chai.request(server)
     .post('/hubs/register')
     .send(req)
     .end((err, res) => {
         res.should.have.status(200)
         res.body.should.be.a('object')
         res.body.should.have.property('result').eql(0)
         res.body.should.have.property('error').eql("")
         done()
     })
  })

  it('should register a second new Hub with the server', (done) => {
    let req = {
      address: "http://test2.test",
      hubCode: hubCode2
    }
    chai.request(server)
     .post('/hubs/register')
     .send(req)
     .end((err, res) => {
         res.should.have.status(200)
         res.body.should.be.a('object')
         res.body.should.have.property('result').eql(0)
         res.body.should.have.property('error').eql("")
         done()
     })
  })

  //Add two hubs to a user
  it('should add a registed Hub to a User', (done) => {
    let req = {
      hubCode: hubCode1,
      hubName: "testName1"
    }
    chai.request(server)
     .post('/hubs/add')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })

  it('should add a second registed Hub to a User', (done) => {
    let req = {
      hubCode: hubCode2,
      hubName: "testName2"
    }
    chai.request(server)
     .post('/hubs/add')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })

  it('should retrieve list of two hubs', (done) => {
    chai.request(server)
     .get('/hubs/')
     .set('x-access-token', userToken)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       res.body.should.have.property('hubs').length(2)
       hubID1 = res.body.hubs[0]
       hubID2 = res.body.hubs[1]
       done()
     })
  })

  it('should delete testHub2', (done) => {
    let req = {
      hubID: hubID2
    }
    chai.request(server)
     .post('/hubs/delete')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })
  it('should retrieve list of one hub', (done) => {
    chai.request(server)
     .get('/hubs/')
     .set('x-access-token', userToken)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       res.body.should.have.property('hubs').length(1)
       done()
     })
  })
})

describe('Register/Find Nearby/Add/Update/GetAll/Delete Device', () => {
  before((done) => {
    Device.remove({}, (err) => {
      done()
    })
  })

  it('should register a new device with the server', (done) => {
    let req = {
      deviceLink: "http://demo.openhab.org:8080/rest/items/Heating_GF_Toilet",
      hubCode: hubCode1
    }
    chai.request(server)
     .post('/devices/register')
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })
  it('should register a second new device with the server', (done) => {
    let req = {
      deviceLink: "http://demo.openhab.org:8080/rest/items/Light_FF_Child_Ceiling",
      hubCode: hubCode1
    }
    chai.request(server)
     .post('/devices/register')
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })

  it('should find 2 "unregistered with a hub" devices', (done) => {
    let req = {
      hubID: hubID1
    }
    chai.request(server)
     .post('/devices/nearby')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       res.body.should.have.property('devices').length(2)
       deviceID1 = res.body.devices[0]
       deviceID2 = res.body.devices[1]
       done()
     })
  })

  it('should add testDevice1 to the hub', (done) => {
    let req = {
      hubID: hubID1,
      deviceID: deviceID1,
      deviceName: "testDevice1"
    }
    chai.request(server)
     .post('/devices/add')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })

  it('should add testDevice2 to the hub', (done) => {
    let req = {
      hubID: hubID1,
      deviceID: deviceID2,
      deviceName: "testDevice2"
    }
    chai.request(server)
     .post('/devices/add')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })
  it('should find 0 "unregistered with a hub" devices', (done) => {
    let req = {
      hubID: hubID1
    }
    chai.request(server)
     .post('/devices/nearby')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       res.body.should.have.property('devices').length(0)
       done()
     })
  })

  it('should get all of a hubs 2 devices', (done) => {
    let req = {
      hubID: hubID1
    }
    chai.request(server)
     .post('/devices/')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       res.body.should.have.property('devices').length(2)
       done()
     })
  })

  it('should delete testDevice2 from the hub', (done) => {
    let req = {
      hubID: hubID1,
      deviceID: deviceID2
    }
    chai.request(server)
     .post('/devices/delete')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       done()
     })
  })

  it('should get all of a hubs 1 device', (done) => {
    let req = {
      hubID: hubID1
    }
    chai.request(server)
     .post('/devices/')
     .set('x-access-token', userToken)
     .send(req)
     .end((err, res) => {
       res.should.have.status(200)
       res.body.should.be.a('object')
       res.body.should.have.property('result').eql(0)
       res.body.should.have.property('error').eql("")
       res.body.should.have.property('devices').length(1)
       done()
     })
  })

  it('should update testDevice1 to OFF', (done) => {
    let req = {
      hubID: hubID1,
      deviceID: deviceID1,
      deviceSettings: "OFF"
    }
    chai.request(server)
      .post('/devices/update')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })

  it('should get testDevice1, state should be OFF', (done) => {
    chai.request(server)
      .get('/devices/'+deviceID1._id)
      .set('x-access-token', userToken)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('device')
        res.body.device.should.have.property('state').eql("OFF")
        done()
      })
  })

  it('should update testDevice1 to ON', (done) => {
    let req = {
      hubID: hubID1,
      deviceID: deviceID1,
      deviceSettings: "ON"
    }
    chai.request(server)
      .post('/devices/update')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })

  it('should get testDevice1, state should be ON', (done) => {
    chai.request(server)
      .get('/devices/'+deviceID1._id)
      .set('x-access-token', userToken)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('device')
        res.body.device.should.have.property('state').eql("ON")
        done()
      })
  })

  it('should update testDevice1 to OFF', (done) => {
    let req = {
      hubID: hubID1,
      deviceID: deviceID1,
      deviceSettings: "OFF"
    }
    chai.request(server)
      .post('/devices/update')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })
})

describe('Add/GetAllGroups/Delete/AddDevice/GetGroup/RemoveDevice Group', () => {
  before((done) => {
    Group.remove({}, (err) => {
      done()
    })
  })

  it('should add a new group to a hub', (done) => {
    let req = {
      hubID: hubID1,
      groupName: "testGroup",
      groupType: "General"
    }
    chai.request(server)
      .post('/groups/add')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })
  it('should get all of a hubs 1 groups', (done) => {
    let req = {
      hubID: hubID1
    }
    chai.request(server)
      .post('/groups/')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('groups').length(1)
        groupID = res.body.groups[0]
        done()
      })
  })

  it('should add testDevice1 to a group', (done) => {
    let req = {
      hubID: hubID1,
      groupID: groupID,
      deviceID: deviceID1
    }
    chai.request(server)
      .post('/groups/addDevice')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })

  it('should get all of a groups 1 devices', (done) => {
    chai.request(server)
      .get('/groups/'+groupID._id)
      .set('x-access-token', userToken)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('devices').length(1)
        done()
      })
  })

  it('should remove a device from a group', (done) => {
    let req = {
      hubID: hubID1,
      groupID: groupID,
      deviceID: deviceID1
    }
    chai.request(server)
      .post('/groups/removeDevice')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })

  it('should get all of a groups 0 devices', (done) => {
    chai.request(server)
      .get('/groups/'+groupID._id)
      .set('x-access-token', userToken)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('devices').length(0)
        done()
      })
  })

  it('should delete a group', (done) => {
    let req = {
      hubID: hubID1,
      groupID: groupID
    }
    chai.request(server)
      .post('/groups/delete')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        done()
      })
  })

  it('should get all of a hubs 0 groups', (done) => {
    let req = {
      hubID: hubID1
    }
    chai.request(server)
      .post('/groups/')
      .set('x-access-token', userToken)
      .send(req)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('result').eql(0)
        res.body.should.have.property('error').eql("")
        res.body.should.have.property('groups').length(0)
        done()
      })
  })
})

/*descirbe('Add/sendCommand/Delete Automation', () => {
  before((done) => {
    Automation.remove({}, (err) => {
      done()
    })
  })

  it('should create an automation on a hub', (done) => {})
  it('should get a list of all 1 automations on a hub', (done) => {})
  it('should add a device and its settings to a hub', (done) => {})
  it('should get a list of all 1 devices and their settings in an automation', (done) => {})
  it('should update an automation', (done) => {})
  it('should check the status of the updated 1 devices, (device func)', (done) => {})
  it('should remove a device from an automation', (done) => {})
  it('should get a list of all 0 devices and their settings in an automation', (done) => {})
  it('should delete an automation from a hub', (done) => {})
  it('should get a list of all 0 automations on a hub', (done) => {})
})*/
