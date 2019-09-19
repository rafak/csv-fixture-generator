'use strict'

const _ = require('lodash')

const location = {
  'Override': {
    function: function() {
      const locNum = this.db.locations.length + 1
      const passedParam = _.get(this, `db._userOptions.locations.${locNum-1}`,'@6:00')
      const params = passedParam.replace(/^([^@]*)@?([0-9:]*)$/,'$1@$2')
      const override = params.split('@')
      return {
        id:  _.first(override) || locNum,
        week_start: (_.last(override) || '06:00')
          .split(':')
          .map(x => ('0' + x).slice(-2))
          .concat(['00'])
          .join(':')
      }
    },
    virtual:true
  },
  'Location ID': {
    self:'Override.id'
  },
  'Location Name': {
    faker: 'address.city'
  },
  'Week Start Time': {
    self:'Override.week_start'
  }
}

module.exports = location