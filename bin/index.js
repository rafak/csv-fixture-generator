'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const Bluebird = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const mocker = require('mocker-data-generator').default
const templates = require('../templates')
const { Parser } = require('json2csv');
const program = require('commander');
program.version(require('../package.json').version)

// L-locations, J-jobs, E-employees, C-categories, I-items, S-sales
// T-transactions, A-attendence (shifts)
const defaultPattern = 'L2.J4.E6.C10.I20.S20.T5.A2'


const parsePattern = (value, previous) => {
  const proper = /([ACEIJLST]\d+)+/
  const filtered = _.toUpper(value).replace(/[^A-Z0-9]/g,'')
  if (!proper.test(filtered)) {
    throw new Error('Bad pattern format')
  }
  const types = filtered.split(/(?<=\d)(?=\D)/)
  const parsed = _.reduce(types, (acc, t) => {
    const pair = t.split(/(?<=\D)(?=\d)/)
    return _.assign(acc, _.fromPairs([pair]))
  }, {})

  return _.mapValues(parsed, parseInt)
}

const unwind = collection => _.flatMap(collection, row => {
  const compoundKeys = _.pickBy(row, _.overSome(_.isArray, _.isPlainObject))
  if (!_.isEmpty(compoundKeys)) {
    const subCollection = unwind(_.flow(_.values, _.castArray, _.flatten)(compoundKeys))
    const otherKeys = _.pickBy(row, _.negate(_.overSome(_.isArray, _.isPlainObject)))
    return _.flatMap(subCollection, obj => _.assign({}, otherKeys, obj))
  }
  return row

})

const run = (P) => {
  return mocker()
    .schema('locations', templates.csv.location, P.L)
    .schema('jobs', templates.csv.job, P.J)
    .schema('employees', templates.csv.employee, P.E)
    .schema('categories', templates.csv.category, P.C)
    .schema('items', templates.csv.item, P.I)
    // .schema('sales', templates.csv.sales, P.S)
    .schema('transactions', templates.csv.transaction, P.T)
    .schema('attendance', templates.csv.timeattendance, P.A)
    .build()
    .then(json => {
      const toPublish = _.mapValues(json, unwind)
      return {
        employees: (new Parser()).parse(toPublish.employees),
        items: (new Parser()).parse(toPublish.items),
        transactions: (new Parser()).parse(toPublish.transactions),
        attendance: (new Parser()).parse(toPublish.attendance)
      }
    })
    .then(data => {
      return Bluebird.map(_.keys(data), key => {
        const file = path.join(program.output, `${program.prefix}-out-${key}.csv`)
        return fs.writeFile(file, data[key])
          .then(() => console.log('Finished writing file: ', file))
          .catch(console.error)
      })
    })
}

program
  .description('Generate csv fixtures based on pattern.'        +
    '\n If no pattern is provided a default one will be used. ' +
    '\n Pattern syntax: E3:T5.I2A-10'+
    '\n\n This will generate 3 employees, 2 items, 5 transactions and 10 shifts.'+
    '\n\n any non alfanum character can be used as the separator for (or none).' +
    '\n\n Codes: L-locations, J-jobs, E-employees, C-categories, I-items, S-sales, '+
    '\n T-transactions, A-attendence (shifts).'+
    '\n\n Default pattern: ' + defaultPattern)
  .option('-p, --pattern [string]', 'generation pattern', parsePattern, defaultPattern)
  .option('-o, --output [string]', 'output file path', '.')
  .option('-x, --prefix [string]', 'prefix for filenames', crypto.randomBytes(6).toString('hex'))
  .parse(process.argv)

  run(_.defaults(program.pattern, parsePattern(defaultPattern)))
    .then(() => console.log('DONE'))
    .catch(console.error)