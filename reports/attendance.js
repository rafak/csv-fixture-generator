'use strict'

const _ = require('lodash')
const moment = require('moment-timezone')

const asFloat = n => _.flow([_.property(n), parseFloat])

const reportWith = (data, extractorFun) => {
  return _
    .chain(data)
    .sortBy('Business Date', 'Location')
    .groupBy(x => ['Date: ' + moment(x['Business Date']).format('Y-MM-DD'), 'Loc ID ' + x['Location'] + ': '].join(', '))
    .mapValues(extractorFun)
    .mapValues((v, k) => {
      const aString = _.overSome(_.isArray, _.isPlainObject)(v)
        ? _.isArray(v)
          ? _.map(v, r => [k, r].join('')).join('\n')
          : _.map(v, (ov, ok) => [ok, ov].join(' ')).join('\n')
        : [k, v].join(' ')
      return aString
    })
    .values()
    .sortBy()
    .value()
}

module.exports = (data) => {
  const dateRange = _.chain(data).groupBy('Business Date').keys().sortBy()
    .thru(_.over([_.first, _.last])).map(n => moment(n).format('Y-M-D'))
    .join(', ')
    .value()

  const locationsIds = _.chain(data).groupBy('Location').keys().sortBy().uniq().value()
  // const shiftsCount = _.chain(data).groupBy('Shift ID').keys().uniq().size().value()

  const reportMeta = [
    `Date range in file: ${dateRange}`,
    `Location ids: ${locationsIds}`,
    `Number of shifts: ${data.length}`,
    // `Number of unique shifts: ${shiftsCount}`
  ]

  const shifts = reportWith(data, (shifts) => {
    const qty = shifts.length
    const totalPay = _.sumBy(shifts, asFloat('Total Pay')).toFixed(2)
    //shifts.reduce((total, shift) => total + parseFloat(shift['Total Pay'], 0.00))
    return [`${qty} shifts`, `$${totalPay}`].join(', ')
  })

  const overtime = reportWith(data, (shifts) => {
    const qty = (_.sumBy(shifts, asFloat('Total OT Minutes')) / 60)
    const totalPay = _.sumBy(shifts, asFloat('Total OT Pay')).toFixed(2)
    return [`${qty} OT hours`, `$${totalPay}`].join(', ')
  })

  const jobsExtractor = data => {
    const report = _.chain(data)
      .map('Job Name')
      .uniq()
      .reduce((obj, job) => {
        const jobReport = reportWith(_.filter(data, { 'Job Name': job }), (shifts) => {
          return {
            [job]: [
              // `${job}`,
              `${(_.sumBy(shifts, asFloat('Total Minutes')) / 60).toFixed(2)} hours`,
              `$${(_.sumBy(shifts, asFloat('Total Pay'))).toFixed(2)}`
            ].join(', ')
          }
        })
        obj[job] = jobReport.join('\n')
        return obj
      }, {})
      .map(_.identity)
      .value()
    return report
  }

  const jobs = reportWith(data, jobsExtractor)

  const employees = reportWith(data, (shifts) => {
    const shiftEmps = _.chain(shifts).map('Employee ID').value()
    const otEmps = _.chain(shifts).filter(s => s['Total OT Minutes'] !== '0').value()
    return [
      `${shiftEmps.length} (${_.uniq(shiftEmps).length}) employees with shifts`,
      `${otEmps.length} (${_.uniq(otEmps).length}) employees with OT`,
      `${shiftEmps.length - _.uniq(shiftEmps).length} employees with multiple shifts`,
    ]
  })

  const samples = reportWith(data, (shifts) => {
    const otEmps = _.chain(shifts).filter(s => s['Total OT Minutes'] !== '0').value()
    const empIds = _.chain(otEmps).map('Employee ID').uniq().value()
    if (_.size(empIds) === 0) {
      return null
    }
    return 'employees with ot hours: ' + _.take(empIds, 5).join(', ')
  })

  return _
    .chain([
      reportMeta,
      shifts,
      overtime,
      jobs,
      employees,
      ['Sample set of employees with OT'],
      samples
    ])
    .map(_.compact)
    .filter(_.size)
    .map(parts => {
      let lastDate = null
      const newParts = _.reduce(parts, (out, part) => {
        const partDate = _.nth(part.match(/^Date: (\d{4}-\d{2}-\d{2})/),1)
        const mid = lastDate && partDate !== lastDate ? [' '] : null
        lastDate = partDate
        return _.concat(out, mid || null, part)
      }, [])
      return _.compact(newParts).map(_.trim)
    })
    .map(parts => parts.join('\n'))
    .join('\n\n')
    .value()
}