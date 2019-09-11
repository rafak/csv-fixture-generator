'use strict'
const _ = require('lodash')

const sales = {
  'Item':{
    hasOne: 'items',
    virtual: true
  },
  'object["Element Type"]=="ITEM",Quantity': {
    eval: 'faker.random.number({min: 1, max: 10})'
  },
  'object["Element Type"]!="ITEM",Quantity': {
    static: 1
  },
  'Amount': {
    faker: 'finance.amount'
  },
  'Element Type' :{
    function: function() {
      // if we have no sales return a sale
      // if (this.db[])
      // 90% items
      if (Math.random() <= 0.9) {
        return 'ITEM'
      }
      return _.sample(['DISCOUNT','TAX','ITAX','AUTOGRAT','SERVICE','VOID','MISC','CASH','VISA',
      'MC','AMEX','DISCOVER','VISA TIP','MC TIP','AMEX TIP','DISCOVER TIP'])
    }
    // values: [
    //   'ITEM','ITEM','ITEM','ITEM','ITEM','ITEM','ITEM','ITEM','ITEM','ITEM','ITEM','ITEM',
    //   'DISCOUNT','TAX','ITAX','AUTOGRAT','SERVICE','VOID','MISC','CASH','VISA',
    //   'MC','AMEX','DISCOVER','VISA TIP','MC TIP','AMEX TIP','DISCOVER TIP']
  },
  'object["Element Type"]=="ITEM",Element ID': {
    self:'Item["Item ID"]',
    eval:true
  },
  'object["Element Type"]=="ITEM",Element Description': {
    self:'Item["Item Name"]',
    eval:true
  },
  'object["Element Type"]=="DISCOUNT",Element ID': {
    faker: 'lorem.words'
  },
  'object["Element Type"]=="DISCOUNT",Element Description': {
    self:'Element ID'
  },
}

module.exports = sales