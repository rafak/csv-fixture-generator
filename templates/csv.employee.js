'use strict'

const employee = {
  'Location': {
    hasOne: 'locations',
    get: 'Location ID'
  },
  'Employee ID': {
    randexp: /[a-zA-Z0-9]{5,7}/
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