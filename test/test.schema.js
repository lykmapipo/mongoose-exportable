'use strict';

/* dependencies */
const { Schema } = require('@lykmapipo/mongoose-common');
const { expect } = require('@lykmapipo/mongoose-test-helpers');


module.exports = new Schema({
  name: {
    type: String,
    fake: f => f.name.findName(),
    exportable: true
  },
  contact: {
    phone: {
      type: String,
      fake: f => f.phone.phoneNumber(),
      exportable: true
    },
    email: {
      type: String,
      fake: f => f.internet.email()
    }
  },
  age: {
    type: Number,
    fake: f => f.random.number({ min: 5, max: 85 }),
    exportable: {
      format: (val, instance) => {
        expect(instance).to.exist;
        return val;
      }
    }
  },
  titles: {
    type: [String],
    fake: f => f.lorem.words(5).split(' '),
    exportable: { header: 'Titles' }
  }
});