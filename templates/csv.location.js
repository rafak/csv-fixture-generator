'use strict'

const _ = require('lodash')

const location = {
  'Location ID': {
    function: function() {
      const result = _.cond([
        [_.flow(_.property('db._userOptions.locations.length')), x => this.faker.random.arrayElement(x.db._userOptions.locations)],
        [_.stubTrue, x => (x.db['locations'].length || 0) + 1],
      ])(this)

      return result
      // if (_.get(this,'_userOptions.locations') && this._userOptions.locations.length > 0) {
      //   return this.faker.random.arrayElement(this._userOptions['locations'])
      // }
      // return (this.db['locations'].length || 0) + 1
    }
    // faker: 'random.uuid'
    // incrementalId: 1
  },
  'Location Name': {
    faker: 'address.city'
  }
}

module.exports = location