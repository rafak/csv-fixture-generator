'use strict'

const _ = require('lodash')
const moment = require('moment-timezone')
const randomWords = require('random-words')

// remove MISC from items so it's not confused with payments
const ITEM_TYPES = ['ITEM', 'DISCOUNT', 'AUTOGRAT', 'SERVICE', 'VOID',] //'MISC']
const PAYMENT_TYPES = ['CASH', 'VISA', 'MC', 'AMEX', 'DISCOVER', 'MISC']
const TAX_TYPES = ['TAX', 'ITAX']

const transaction = {
  'Location': {
    hasOne: 'locations',
    get: 'Location ID'
  },
  'Date': {
    function: function() {
      return moment(this.faker.date.recent()).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  'Trans/Check ID': {
    incrementalId:10000
  },
  'Employee ID': {
    function: function () {
      const empSource = this.db.employees.filter(x => this.object.Location === x.Location)
      return this.faker.random.arrayElement(empSource)['Employee ID']
    },
    // hasOne: 'employees',
    // get: 'Employee ID'
  },
  'Items': {
    function: function () {
      const itemSource = this.db.items.filter(x => this.object.Location === x.Location)
      // randomize number of items in this check
      const itemCount = this.faker.random.number({ min: 0, max: 3 })

      // at least one item
      let types = _.concat(['ITEM'],
        // other random items
        _.times(itemCount, () => _.sample(ITEM_TYPES)),
        // one tax
        _.sample(TAX_TYPES),
        // one payment
        _.sample(PAYMENT_TYPES))

      // perhaps a card tip
      if (Math.random() >= 0.5) {
        const paymentType = _.last(types)
        if (!['CASH', 'MISC'].includes(paymentType)) {
          // seems like tip is not included in payment sum
          types.push(paymentType + ' TIP')
          // types = _.concat(_.initial(types),paymentType + ' TIP', paymentType)
        }
      }
      let salesSum = 0
      return _.map(types, t => {
        // random item
        const salesItem = _.sample(itemSource)
        // random quantity for ITEMS, otherwise 1
        const qty = t === 'ITEM' ? this.faker.random.number({ min: 1, max: 5 }) : 1
        const id = t === 'ITEM' ? salesItem['Item ID'] : _.includes(ITEM_TYPES, t) ? randomWords({ min: 2, max: 4 , join:'-'}) : null
        const desc = t === 'ITEM' ? salesItem['Item Name'] : id ? id.split('-').map(x=>x.charAt(0).toUpperCase() + x.slice(1)).join(' '): null
        const amount = _.cond([
          [ x => x === 'ITEM',              () => (qty * salesItem['Item Price']).toFixed(2) ],
          [ x => x === 'DISCOUNT',          () => (salesSum * Math.random() * 30/100).toFixed(2) ],
          [ x => x === 'VOID',          () => (salesSum * (Math.random()> 0.5 ? 1 : Math.random())).toFixed(2) ],
          [ x => _.includes(ITEM_TYPES, x), () => (this.faker.random.number({ min: 1, max: 50 })/10).toFixed(2) ],
          [ x => _.includes(TAX_TYPES, x),  () => (salesSum * 0.045).toFixed(2) ],
          [ x => _.includes(x, 'TIP'),      () => (salesSum * Math.random() * 10/100).toFixed(2) ],
          [ _.stubTrue,                   _.constant(salesSum.toFixed(2)) ]
        ])(t)

        salesSum += _.cond([
          [ x =>['VOID', 'DISCOUNT'].includes(x),         _.constant(-amount) ],
          // [ x => _.includes(x, 'TIP'),              _.constant(+amount) ],
          [ x => _.concat(ITEM_TYPES, TAX_TYPES).includes(x), _.constant(+amount) ],
          [ _.stubTrue,                                   _.constant(0) ]
        ])(t)

        return _.pickBy({
          Quantity: qty,
          Amount: amount,
          'Element Type': t,
          'Element ID': id,
          'Element Description': desc,
          'Category ID': _.includes(ITEM_TYPES, t) ? salesItem.Category['Category ID'] : null,
          'Category Name': _.includes(ITEM_TYPES, t) ? salesItem.Category['Category Name'] : null,
        })
      })
    }
  },
}

module.exports = transaction