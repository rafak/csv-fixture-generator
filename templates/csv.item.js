'use strict'

const item = {
  'Location': {
    hasOne: 'locations',
    get: 'Location ID'
  },
  'Category':{
    hasOne: 'categories'
  },
  'Item ID': {
    // faker: 'random.uuid'
    incrementalId: 1
  },
  'Item Name': {
    faker: 'commerce.productName'
  },
  'Item Price': {
    eval: '(faker.random.number({max:999})/100).toFixed(2)'
  }
}

module.exports = item