const mongoose = require('mongoose')
const {expect} = require('chai')
const sinon = require('sinon')
require('sinon-mongoose')

const User = require('../models/User')
const Hub = require('../models/Hub')
const Device = require('../models/Device')

// Test User Model
describe('User Model', () => {
  it('should create a new user', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }))
    const user = UserMock.object

    UserMock
      .expects('save')
      .yields(null)

    user.save(function (err, result) {
      UserMock.verify()
      UserMock.restore()
      expect(err).to.be.null
      done()
    })
  })

  it('should return error if user is not created', (done) => {
    const UserMock = sinon.mock(new User({ email: 'test@gmail.com', password: 'root' }))
    const user = UserMock.object
    const expectedError = {
      name: 'ValidationError'
    }

    UserMock
      .expects('save')
      .yields(expectedError)

    user.save((err, result) => {
      UserMock.verify()
      UserMock.restore()
      expect(err.name).to.equal('ValidationError')
      expect(result).to.be.undefined
      done()
    })
  })

  it('should not create a user with the unique email', (done) => {
    const UserMock = sinon.mock(User({ email: 'test@gmail.com', password: 'root' }))
    const user = UserMock.object
    const expectedError = {
      name: 'MongoError',
      code: 11000
    }

    UserMock
      .expects('save')
      .yields(expectedError)

    user.save((err, result) => {
      UserMock.verify()
      UserMock.restore()
      expect(err.name).to.equal('MongoError')
      expect(err.code).to.equal(11000)
      expect(result).to.be.undefined
      done()
    })
  })

  it('should find user by email', (done) => {
    const userMock = sinon.mock(User)
    const expectedUser = {
      _id: '5700a128bd97c1341d8fb365',
      email: 'test@gmail.com'
    }

    userMock
      .expects('findOne')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedUser)

    User.findOne({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify()
      userMock.restore()
      expect(result.email).to.equal('test@gmail.com')
      done()
    })
  })

  it('should remove user by email', (done) => {
    const userMock = sinon.mock(User)
    const expectedResult = {
      nRemoved: 1
    }

    userMock
      .expects('remove')
      .withArgs({ email: 'test@gmail.com' })
      .yields(null, expectedResult)

    User.remove({ email: 'test@gmail.com' }, (err, result) => {
      userMock.verify()
      userMock.restore()
      expect(err).to.be.null
      expect(result.nRemoved).to.equal(1)
      done()
    })
  })
})

// Test Hub Model
describe('Hub Model', () => {
  it('should create a new hub', (done) => {
    const HubMock = sinon.mock(new Hub({ hubCode: 'testCode', address: 'd97c1341d' }))
    const hub = HubMock.object

    HubMock
      .expects('save')
      .yields(null)

    hub.save(function (err, result) {
      HubMock.verify()
      HubMock.restore()
      expect(err).to.be.null
      done()
    })
  })

  it('should return error if hub is not created', (done) => {
    const HubMock = sinon.mock(new Hub({ hubCode: 'testCode', address: 'd97c1341d' }))
    const hub = HubMock.object
    const expectedError = {
      name: 'ValidationError'
    }

    HubMock
      .expects('save')
      .yields(expectedError)

    hub.save((err, result) => {
      HubMock.verify()
      HubMock.restore()
      expect(err.name).to.equal('ValidationError')
      expect(result).to.be.undefined
      done()
    })
  })

  it('should not create a hub with the unique hubCode', (done) => {
    const HubMock = sinon.mock(Hub({ hubCode: 'testCode', address: 'd97c1341d' }))
    const hub = HubMock.object
    const expectedError = {
      name: 'MongoError',
      code: 11000
    }

    HubMock
      .expects('save')
      .yields(expectedError)

    hub.save((err, result) => {
      HubMock.verify()
      HubMock.restore()
      expect(err.name).to.equal('MongoError')
      expect(err.code).to.equal(11000)
      expect(result).to.be.undefined
      done()
    })
  })

  it('should find hub by hubCode', (done) => {
    const hubMock = sinon.mock(Hub)
    const expectedHub = {
      _id: '5700a128bd97c1341d8fb365',
      hubCode: 'testCode'
    }

    hubMock
      .expects('findOne')
      .withArgs({ hubCode: 'testCode' })
      .yields(null, expectedHub)

    Hub.findOne({ hubCode: 'testCode' }, (err, result) => {
      hubMock.verify()
      hubMock.restore()
      expect(result.hubCode).to.equal('testCode')
      done()
    })
  })

  it('should remove hub by hubCode', (done) => {
    const hubMock = sinon.mock(Hub)
    const expectedResult = {
      nRemoved: 1
    }

    hubMock
      .expects('remove')
      .withArgs({ hubCode: 'testCode' })
      .yields(null, expectedResult)

    Hub.remove({ hubCode: 'testCode' }, (err, result) => {
      hubMock.verify()
      hubMock.restore()
      expect(err).to.be.null
      expect(result.nRemoved).to.equal(1)
      done()
    })
  })
})

// Test Device Model
describe('Device Model', () => {
  it('should create a new device', (done) => {
    const DeviceMock = sinon.mock(new Device({ hubID: 'd97c1341d', link: '/test', name: 'testDevice' }))
    const device = DeviceMock.object

    DeviceMock
      .expects('save')
      .yields(null)

    device.save(function (err, result) {
      DeviceMock.verify()
      DeviceMock.restore()
      expect(err).to.be.null
      done()
    })
  })

  it('should return error if device is not created', (done) => {
    const DeviceMock = sinon.mock(new Device({ hubID: 'd97c1341d', link: 'testing.com/testing/test', name: 'testDevice' }))
    const device = DeviceMock.object
    const expectedError = {
      name: 'ValidationError'
    }

    DeviceMock
      .expects('save')
      .yields(expectedError)

    device.save((err, result) => {
      DeviceMock.verify()
      DeviceMock.restore()
      expect(err.name).to.equal('ValidationError')
      expect(result).to.be.undefined
      done()
    })
  })

  it('should not create a device with the unique link', (done) => {
    const DeviceMock = sinon.mock(Device({ hubID: 'd97c1341d', link: 'testing.com/testing/test', name: 'testDevice' }))
    const device = DeviceMock.object
    const expectedError = {
      name: 'MongoError',
      code: 11000
    }

    DeviceMock
      .expects('save')
      .yields(expectedError)

    device.save((err, result) => {
      DeviceMock.verify()
      DeviceMock.restore()
      expect(err.name).to.equal('MongoError')
      expect(err.code).to.equal(11000)
      expect(result).to.be.undefined
      done()
    })
  })

  it('should find device by link', (done) => {
    const deviceMock = sinon.mock(Device)
    const expectedDevice = {
      _id: '5700a128bd97c1341d8fb365',
      link: 'testing.com/testing/test'
    }

    deviceMock
      .expects('findOne')
      .withArgs({ link: 'testing.com/testing/test' })
      .yields(null, expectedDevice)

    Device.findOne({ link: 'testing.com/testing/test' }, (err, result) => {
      deviceMock.verify()
      deviceMock.restore()
      expect(result.link).to.equal('testing.com/testing/test')
      done()
    })
  })

  it('should remove device by link', (done) => {
    const deviceMock = sinon.mock(Device)
    const expectedResult = {
      nRemoved: 1
    }

    deviceMock
      .expects('remove')
      .withArgs({ link: 'testing.com/testing/test' })
      .yields(null, expectedResult)

    Device.remove({ link: 'testing.com/testing/test' }, (err, result) => {
      deviceMock.verify()
      deviceMock.restore()
      expect(err).to.be.null
      expect(result.nRemoved).to.equal(1)
      done()
    })
  })
})
