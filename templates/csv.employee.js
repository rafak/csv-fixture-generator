'use strict'

const employee = {
  'Location': {
    hasOne: 'locations',
    get: 'Location ID'
  },
  'Employee ID': {
    // faker: 'random.uuid'
    incrementalId: 1
  },
  'First Name': {
    faker: 'name.firstName'
  },
  'Last Name': {
    faker: 'name.lastName'
  },
  'Employee Number': {
    faker: 'random.number'
  },
  'Jobs': {
    hasMany: 'jobs',
    max: 3,
    unique: true
  }
}

module.exports = employee