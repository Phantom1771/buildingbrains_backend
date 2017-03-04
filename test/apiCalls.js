const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

const User = require('../models/User')
const Hub = require('../models/Hub')

chai.use(chaiHttp)

var userToken = ""
var hubCode1 = "testHubCode1"
var hubCode2 = "testHubCode2"
var hubID1 = ""
var hubID2 = ""


describe('Create/Login/Logout User', () => {
  before((done) => {
      User.remove({}, (err) => {
         done()
      })
  })
  before((done) => {
      Hub.remove({}, (err) => {
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
       res.body.should.have.property('hubs')
       hubID1 = res.body.hubs[0]
       hubID2 = res.body.hubs[1]
       done()
     })
  })
  //it('should delete testHub2', (done) => {})
  //it('should retrieve list of one hub', (done) => {})
})

/*describe('Register/Find Nearby/Add/Update/GetAll/Delete Device', () => {
  it('should register a new device with the server', (done) => {})
  it('should register a second new device with the server', (done) => {})
  it('should find all "unregistered ith a user" devices', (done) => {})
  it('should add testDevice1 to the hub', (done) => {})
  it('should add testDevice2 to the hub', (done) => {})
  it('should get all of a hubs devices', (done) => {})
  it('should delete testDevice2 from the hub', (done) => {})
  it('should update testDevice1', (done) => {})
  it('should get all of a hubs devices', (done) => {})
}*/

/*describe('Add/GetAllGroups/Delete/AddDevice/GetGroup/RemoveDevice Group', () => {
  it('should add a new group to a hub', (done) => {})
  it('should get all of a hubs groups', (done) => {})
  it('should add testDevice1 to a group' (done) => {})
  it('should get all of a groups devices', (done) => {})
  it('should remove a device from a group', (done) => {})
  it('should get all of a groups devices', (done) => {})
  it('should delete a group', (done) => {})
  it('should get all of a hubs groups', (done) => {})
})*/

/*descirbe('Add/sendCommand/Delete Automation', () => {

})*/
