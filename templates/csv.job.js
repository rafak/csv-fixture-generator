'use strict'

const job = {
  'Job ID': {
    // faker: 'random.uuid'
    incrementalId: 1
  },
  'Job Name': {
    faker: 'name.jobTitle'
  },
  'Rate': {
    function: function () {
      return 5 + Math.round(Math.random() * 59) + '.' + Math.round(Math.random() * 99)
    }
  }
}

module.exports = job