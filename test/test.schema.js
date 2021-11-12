import { ObjectId } from '@lykmapipo/mongoose-common';
import { expect } from '@lykmapipo/mongoose-test-helpers';

export default {
  parent: {
    type: ObjectId,
    ref: 'User',
    aggregatable: true,
    exportable: {
      format: (val) => (val && val.name ? { 'Parent Name': val.name } : 'NA'),
    },
  },
  name: {
    type: String,
    fake: (f) => f.name.findName(),
    exportable: true,
  },
  contact: {
    phone: {
      type: String,
      fake: (f) => f.phone.phoneNumber(),
      exportable: true,
    },
    email: {
      type: String,
      fake: (f) => f.internet.email(),
    },
  },
  age: {
    type: Number,
    fake: (f) => f.datatype.number({ min: 5, max: 85 }),
    exportable: {
      format: (val, instance) => {
        expect(instance).to.exist;
        return val;
      },
    },
  },
  titles: {
    type: [String],
    fake: (f) => f.lorem.words(5).split(' '),
    exportable: { header: 'Titles' },
  },
  status: {
    type: String,
    fake: (f) => f.hacker.ingverb(),
    exportable: {
      format: (val) => ({ 'Status Name': val, 'Status Weight': 1 }),
    },
  },
};
