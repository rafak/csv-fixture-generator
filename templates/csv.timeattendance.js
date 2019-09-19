'use strict'

const moment = require('moment-timezone')

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
      const weekStart = this.object._location["Week Start Time"]
      // generate at least 15 min of shift, max 8h
      const totalSecs = this.faker.random.number({min:900, max:28799})
      // generate 0 (50%) or max 2h overtime
      const OTMins = Math.round(Math.random()) * this.faker.random.number({min:0, max:120})
      const clockIn = moment(this.faker.date.recent())
      const businessDate = clockIn.clone().format('YYYY-MM-DD')
      const clockOut = clockIn.clone().add(totalSecs + OTMins * 60,'seconds')
      const weekStartBusinessDate = moment(`${businessDate}T${weekStart}`).isAfter(clockIn) ? moment(businessDate).subtract(1,'day').format('YYYY-MM-DD') : businessDate
      return {
        'Business Date': weekStartBusinessDate,
        'Clock In': clockIn.clone().format('YYYY-MM-DD HH:mm:ss'),
        'Clock Out': clockOut.clone().format('YYYY-MM-DD HH:mm:ss'),
        'Total Minutes': clockOut.diff(clockIn,'minutes'),
        'Total OT Minutes':OTMins,
        'Total Pay': this.faker.finance.amount(),
        'Total OT Pay': OTMins ? this.faker.finance.amount() : 0,
        'Credit Card Tips': this.faker.finance.amount(),
        'Cash Tips': this.faker.finance.amount()
      }
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