'use strict'

const _ = require('lodash')
const moment = require('moment-timezone')

// TODO: move to generic extractor
// const genericExtractor = name => data => {
//   return [`qty ${v.length} ${name}`, `total $${v.reduce((sum, d) => sum + parseFloat(d.Amount), 0.00).toFixed(2)}`].join(', ')
// }

const reportFor = (data, name) => {
  return _
    .chain(data)
    .sortBy('Date', 'Location')
    .groupBy(x => ['Date: ' + moment(x['Date']).format('Y-MM-DD'), 'Loc ID ' + x['Location'] + ': '].join(', '))
    .mapValues(v => [`qty ${v.length} ${name}`, `total $${v.reduce((sum, d) => sum + parseFloat(d.Amount), 0.00).toFixed(2)}`].join(', '))
    .mapValues((v, k) => {
      const aString = _.overSome(_.isArray, _.isPlainObject)(v) ? v.join('\n') : [k, v].join(' ')
      return aString
    })
    .values()
    .sortBy()
    .value()
}

module.exports = (data) => {
  const dateRange = _.chain(data).groupBy('Date').keys().sortBy()
    .thru(_.over([_.first, _.last])).map(n => moment(n).format('Y-MM-DD'))
    .join(', ')
    .value()

  const locationsIds = _.chain(data).groupBy('Location').keys().sortBy().uniq().value()
  const transactionsCount = _.chain(data).groupBy('Trans/Check ID').keys().uniq().size().value()

  const reportMeta = [
    `Date range in file: ${dateRange}`,
    `Location ids: ${locationsIds}`,
    `Number of transactions: ${transactionsCount}`,
  ]


  const payments = [
    reportFor(_.filter(data, { 'Element Type': 'CASH' }), 'cash').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'MC' }), 'mastercard').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'VISA' }), 'visa').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'AMEX' }), 'amex').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'DISCOVER' }), 'discover').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'MISC' }), 'misc').join('\n')
  ]

  const tips = [
    reportFor(_.filter(data, { 'Element Type': 'MC TIP' }), 'mastercard tips').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'VISA TIP' }), 'visa tips').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'AMEX TIP' }), 'amex tips').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'DISCOVER TIP' }), 'discover tips').join('\n'),
  ]

  const taxes = [
    reportFor(_.filter(data, { 'Element Type': 'ITAX' }), 'itax').join('\n'),
    reportFor(_.filter(data, { 'Element Type': 'TAX' }), 'etax').join('\n'),
  ]


  const output = [
    reportMeta,
    reportFor(_.filter(data, { 'Element Type': 'DISCOUNT' }), 'discounts'),
    reportFor(_.filter(data, { 'Element Type': 'VOID' }), 'voids'),
    reportFor(_.filter(data, { 'Element Type': 'AUTOGRAT' }), 'autograt'),
    reportFor(_.filter(data, { 'Element Type': 'SERVICE' }), 'service charges'),
    payments,
    tips,
    taxes
  ]

  return _
    .chain(output)
    .map(_.compact)
    .filter(_.size)
    .map(part => _.sortBy(part))
    .map(part => part.join('\n'))
    .join('\n\n')
    .value()
}