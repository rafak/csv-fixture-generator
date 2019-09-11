'use strict'

const _ = require('lodash')
const ITEM_TYPES = ['ITEM', 'DISCOUNT', 'AUTOGRAT', 'SERVICE', 'VOID', 'MISC']
const PAYMENT_TYPES = ['CASH', 'VISA', 'MC', 'AMEX', 'DISCOVER', 'MISC']
const TAX_TYPES = ['TAX', 'ITAX']

const isItem = t => _.includes(ITEM_TYPES, t)

const transaction = {
  'Location': {
    hasOne: 'locations',
    get: 'Location ID'
  },
  'Date': {
    faker: 'date.recent'
  },
  'Trans/Check ID': {
    faker: 'random.number'
  },
  'Employee': {
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
      if (Math.random() >= 0.7) {
        const paymentType = _.last(types)
        if (!['CASH', 'MISC'].includes(paymentType)) {
          types = _.concat(_.initial(types),paymentType + ' TIP', paymentType)
        }
      }
      let salesSum = 0
      return _.map(types, t => {
        // random item
        const salesItem = _.sample(itemSource)
        // random quantity for ITEMS, otherwise 1
        const qty = t === 'ITEM' ? this.faker.random.number({ min: 1, max: 5 }) : 1
        const id = t === 'ITEM' ? salesItem['Item ID'] : _.includes(ITEM_TYPES, t) ? this.faker.lorem.words() : null
        const desc = t === 'ITEM' ? salesItem['Item Name'] : id ? id: null
        const amount = _.cond([
          [ x => x === 'ITEM',              () => (qty * salesItem['Item Price']).toFixed(2) ],
          [ x => _.includes(ITEM_TYPES, x), () => (this.faker.random.number({ min: 1, max: 50 })/10).toFixed(2) ],
          [ x => _.includes(TAX_TYPES, x),  () => (salesSum * 0.15).toFixed(2) ],
          [ x => _.includes(x, 'TIP'),      () => (salesSum * Math.random() * 10/100).toFixed(2) ],
          [ _.stubTrue(),                   _.constant(salesSum.toFixed(2)) ]
        ])(t)

        salesSum += _.cond([
          [ x =>['VOID', 'DISCOUNT'].includes(x),   _.constant(-amount) ],
          [ x => _.includes(x, 'TIP'),              _.constant(+amount) ],
          [ x => ['ITEM','TAX'].includes(x),        _.constant(+amount) ],
          [ _.stubTrue,                             _.constant(0) ]
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
  // 'Items': {
  //   hasMany: 'sales',
  //   min: 2,
  //   max: 10,
  // }
}

module.exports = transaction