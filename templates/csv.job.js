'use strict'

const job = {
  'Job ID': {
    randexp: /[a-zA-Z0-9]{5,7}/
  },
  'Job Name': {
    faker: 'name.jobTitle'
  },
  'Rate': {
    function: function () {
      return parseFloat(5 + Math.round(Math.random() * 59) + '.' + Math.round(Math.random() * 99))
    }
  }
}

module.exports = job