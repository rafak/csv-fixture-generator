'use strict'

const _ = require('lodash')
const moment = require('moment-timezone')


const maxIterations = 100

const time = {
  _location : {
    hasOne: 'locations',
    virtual: true
  },
  'Location': {
    self:'_location["Location ID"]',
    eval: true
  },
  'Shift ID': {
    randexp: /[a-zA-Z0-9]{5,7}/
  },
  'Employee': {
    function: function () {
      const empSource = this.db.employees.filter(x => this.object.Location === x.Location)
      return this.faker.random.arrayElement(empSource)
    },
    //hasOne: 'employees',
    virtual: true
  },
  'Employee ID':{
    self:'Employee["Employee ID"]',
    eval:true
  },
  'First Name':{
    self:'Employee["First Name"]',
    eval: true
  },
  'Last Name':{
    self:'Employee["Last Name"]',
    eval: true
  },
  'Job':{
    function : function() {
      const jobs = this.object.Employee.Jobs
      return this.faker.random.arrayElement(jobs)
    },
    virtual:true
  },
  'Job ID':{
    self:'Job["Job ID"]',
    eval:true
  },
  'Job Name':{
    self:'Job["Job Name"]',
    eval: true
  },
  'Shift' : {
    function: function() {
      // go the easy way and just generate shifts until we get non-overlapping shifts
      let iterations = 0
      let isOverlap = true
      let shift
      do {
        if (iterations >  maxIterations) {
          throw new Error('Maximum iterations reached for unique shifts generation')
        }
        iterations += 1
        const weekStart = this.object._location["Week Start Time"]
        // generate at least 15 min of shift, max 10h (max 2h of overtime)
        const totalSecs = this.faker.random.number({ min: 900, max: 28799 })
        // calc overtime (any secs over 8h)
        const OTSecs = Math.max(0, totalSecs  - 28799)
        const clockIn = moment(this.faker.date.recent())
        const businessDate = clockIn.clone().format('YYYY-MM-DD')
        const clockOut = clockIn.clone().add(totalSecs, 'seconds')
        // for shifts starting before the week_start_time we need to adjust the
        // business_date
        const weekStartBusinessDate = moment(`${businessDate}T${weekStart}`).isAfter(clockIn)
          ? moment(businessDate).subtract(1, 'day').format('YYYY-MM-DD')
          : businessDate
        // get any existing shifts that might overlap
        // it will be shifts that start before before this shift ends
        // or shifts that end after this shift starts
        const maybeOverlapping = _.find(this.db.attendance, shift => {
          const isSameEmployee = shift['Employee ID'] === this.object['Employee ID']
          const mShiftClockIn  = moment(shift['Clock In'])
          const mShiftClockout = moment(shift['Clock Out'])
          const isShiftAContainer = mShiftClockIn.isBefore(clockIn) && mShiftClockout.isAfter(clockOut)
          const isOverlapClockin = moment(shift['Clock In']).isBetween(clockIn, clockOut)
          const isOverlapClockout = moment(shift['Clock Out']).isBetween(clockIn, clockOut)
          return isSameEmployee && (isShiftAContainer || isOverlapClockin || isOverlapClockout)
        })

        isOverlap = maybeOverlapping !== undefined
        // let's make the wages consistent
        // note: this should be a float
        const baseWage = this.object.Job.Rate
        // overtime 15% more
        const otWage = baseWage*1.15
        const basePay = baseWage * (totalSecs-OTSecs)/3600
        const otPay = otWage * OTSecs/3600

        shift = {
          'Business Date': weekStartBusinessDate,
          'Clock In': clockIn.clone().format('YYYY-MM-DD HH:mm:ss'),
          'Clock Out': clockOut.clone().format('YYYY-MM-DD HH:mm:ss'),
          'Total Minutes': clockOut.diff(clockIn, 'minutes'),
          'Total OT Minutes': (OTSecs/60).toFixed(0),
          'Total Pay': (basePay+otPay).toFixed(2),
          'Total OT Pay': otPay.toFixed(2),
          'Credit Card Tips': (Math.round(Math.random()) * Math.random()*100).toFixed(2),
          'Cash Tips': (Math.round(Math.random()) * Math.random()*100).toFixed(2)
        }
      } while (isOverlap)

      return shift

      // return {
      //   'Business Date': weekStartBusinessDate,
      //   'Clock In': clockIn.clone().format('YYYY-MM-DD HH:mm:ss'),
      //   'Clock Out': clockOut.clone().format('YYYY-MM-DD HH:mm:ss'),
      //   'Total Minutes': clockOut.diff(clockIn,'minutes'),
      //   'Total OT Minutes':OTMins,
      //   'Total Pay': this.faker.finance.amount(),
      //   'Total OT Pay': OTMins ? this.faker.finance.amount() : 0,
      //   'Credit Card Tips': this.faker.finance.amount(),
      //   'Cash Tips': this.faker.finance.amount()
      // }
    },
    virtual:true
  },
  'Clock In' : {
    self: 'Shift["Clock In"]',
    eval: true
  },
  'Clock Out' : {
    self: 'Shift["Clock Out"]',
    eval: true
  },
  'Business Date' : {
    self: 'Shift["Business Date"]',
    eval: true
  },
  'Total Minutes' : {
    self: 'Shift["Total Minutes"]',
    eval: true
  },
  'Total OT Minutes' : {
    self: 'Shift["Total OT Minutes"]',
    eval: true
  },
  'Total Pay' : {
    self: 'Shift["Total Pay"]',
    eval: true
  },
  'Total OT Pay' : {
    self: 'Shift["Total OT Pay"]',
    eval: true
  },
  'Credit Card Tips' : {
    self: 'Shift["Credit Card Tips"]',
    eval: true
  },
  'Cash Tips' : {
    self: 'Shift["Cash Tips"]',
    eval: true
  },

}

module.exports = time