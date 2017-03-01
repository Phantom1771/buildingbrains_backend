const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server')
const should = chai.should();

const User = require('../models/User');
const Hub = require('../models/Hub');

chai.use(chaiHttp);

var userToken = "";
var hubCode1 = "testHubCode1";
var hubCode2 = "testHubCode2";
var hubID1 = "";
var hubID2 = "";


describe('Create/Login/Logout User', () => {
  before((done) => {
      User.remove({}, (err) => {
         done();
      });
  });
  before((done) => {
      Hub.remove({}, (err) => {
         done();
      });
  });

  it('should create a new User', (done) => {
    let req = {
      email: "test@test.com",
      password: "testPass",
      firstName: "test",
      lastName: "testing"
    }
    chai.request(server)
      .post('/users/signup')
      .send(req)
      .end((err, res) => {
         res.should.have.status(200);
         res.body.should.be.a('object');
         res.body.should.have.property('result').eql(0);
         res.body.should.have.property('userToken');
         userToken = res.body.userToken;
         done();
      });
   });

   it('should logout a User', (done) => {
     let req = {}
     chai.request(server)
       .post('/users/logout')
       .set('x-access-token', userToken)
       .send(req)
       .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('result').eql(0);
          done();
       });
   });

   it('should login a User', (done) => {
     let req = {
       email: "test@test.com",
       password: "testPass"
     }
     chai.request(server)
       .post('/users/login')
       .set('x-access-token', userToken)
       .send(req)
       .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('result').eql(0);
          res.body.should.have.property('userToken');
          userToken = res.body.userToken;
          done();
       });
   });
});

describe('Register/Add/GetAll/Delete Hub', () => {
  //Register 2 Hubs
  it('should register a new Hub with the server', (done) => {
    let req = {
      address: "http://test1.test",
      hubCode: hubCode1
    }
    chai.request(server)
     .post('/hubs/register')
     .send(req)
     .end((err, res) => {
         res.should.have.status(200);
         res.body.should.be.a('object');
         res.body.should.have.property('result').eql(0);
         res.body.should.have.property('error').eql("");
         done();
     });
  });

  it('should register a second new Hub with the server', (done) => {
    let req = {
      address: "http://test2.test",
      hubCode: hubCode2
    }
    chai.request(server)
     .post('/hubs/register')
     .send(req)
     .end((err, res) => {
         res.should.have.status(200);
         res.body.should.be.a('object');
         res.body.should.have.property('result').eql(0);
         res.body.should.have.property('error').eql("");
         done();
     });
  });

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
       res.should.have.status(200);
       res.body.should.be.a('object');
       res.body.should.have.property('result').eql(0);
       res.body.should.have.property('error').eql("");
       done();
     });
  });

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
       res.should.have.status(200);
       res.body.should.be.a('object');
       res.body.should.have.property('result').eql(0);
       res.body.should.have.property('error').eql("");
       done();
     });
  });

  it('should retrieve list of hubs', (done) => {
    chai.request(server)
     .get('/hubs/')
     .set('x-access-token', userToken)
     .end((err, res) => {
       res.should.have.status(200);
       res.body.should.be.a('object');
       res.body.should.have.property('result').eql(0);
       res.body.should.have.property('error').eql("");
       res.body.should.have.property('hubs');
       hubID1 = res.body.hubs[0];
       hubID2 = res.body.hubs[1];
       done();
     });
  });
});
