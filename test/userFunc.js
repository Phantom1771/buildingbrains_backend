const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server')
const should = chai.should();

const User = require('../models/User');

chai.use(chaiHttp);

describe('Users', () => {
    beforeEach((done) => {
        User.remove({}, (err) => {
           done();
        });
    });
    describe('POST users/signup', () => {
      it('should POST a User', (done) => {
        let user = {
          email: "test@test.com",
          password: "testPass",
          firstName: "test",
          lastName: "testing"
        }
        chai.request(server)
          .post('/users/signup')
          .send(user)
          .end((err, res) => {
             res.should.have.status(200);
             res.body.should.be.a('object');
             res.body.should.have.property('result').eql(0);
             res.body.should.have.property('userToken');
             done();
          });
       });
    });
});

describe('POST users/signup', () => {
  it('should not POST a duplicate User', (done) => {
    let user = {
      email: "test@test.com",
      password: "testPass",
      firstName: "test",
      lastName: "testing"
    }
    chai.request(server)
      .post('/users/signup')
      .send(user)
      .end((err, res) => {
         res.should.have.status(200);
         res.body.should.be.a('object');
         res.body.should.have.property('result').eql(1);
         done();
      });
   });
});
