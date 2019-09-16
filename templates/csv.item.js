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
    randexp: /[a-zA-Z0-9]{5,7}/
  },
  'Item Name': {
    faker: 'commerce.productName'
  },
  'Item Price': {
    eval: '(faker.random.number({min:30,max:999})/100).toFixed(2)'
  }
}

module.exports = item