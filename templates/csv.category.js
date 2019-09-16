'use strict'

const category = {
  'Category ID': {
    randexp: /[a-zA-Z0-9]{5,7}/
  },
  'Category Name': {
    faker: 'commerce.product'
  }
}

module.exports = category