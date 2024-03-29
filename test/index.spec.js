import { createWriteStream } from 'fs';
import _ from 'lodash';
import {
  clear,
  create,
  expect,
  createTestModel,
  // enableDebug,
  // disableDebug
} from '@lykmapipo/mongoose-test-helpers';
import aggregatable from '@lykmapipo/mongoose-aggregatable';
import csv2array from 'csv-to-array';
import exportable from '../src';
import schema from './test.schema';

const readCsv = (done) =>
  csv2array({ file: `${__dirname}/fixtures/out.csv`, columns: true }, done);

const User = createTestModel(
  schema,
  { modelName: 'User' },
  aggregatable,
  exportable
);

describe('mongoose-exportable', () => {
  const users = User.fake(3);
  users[1].parent = users[0];
  users[2].parent = users[0];

  before((done) => clear(done));

  before((done) => create(...users, done));

  const assertExport = (error, records) => {
    expect(error).to.not.exist;
    expect(records).to.exist;

    const names = _.map(users, 'name');
    const ages = _.map(users, 'age');
    const statuses = _.map(users, 'status');

    expect(names).to.include.members(_.map(records, 'Name'));
    expect(statuses).to.include.members(_.map(records, 'Status Name'));
    expect(ages).to.include.members(_.map(records, (v) => Number(v.Age)));
  };

  it('should navigate paths and build exportable fields', () => {
    expect(User.EXPORTABLE_FIELDS).to.exist;
    expect(User.EXPORTABLE_FIELDS).to.be.an('object');
    expect(User.EXPORTABLE_FIELDS).to.have.property('age');
    expect(User.EXPORTABLE_FIELDS).to.have.property('name');
    expect(User.EXPORTABLE_FIELDS).to.have.property('contact.phone');
    expect(User.EXPORTABLE_FIELDS).to.have.property('titles');
    expect(User.EXPORTABLE_FIELDS).to.not.have.property('contact.email');
  });

  it('should set default exportable field options', () => {
    const { age } = User.EXPORTABLE_FIELDS;
    expect(age.path).to.be.equal('age');
    expect(age.header).to.be.equal('Age');
    expect(age.order).to.be.equal(Number.MAX_SAFE_INTEGER);
    expect(age.format).to.be.a('function');
    expect(age.format(4)).to.be.equal(4);
    expect(age.format()).to.be.equal(0);
  });

  it('should return readable stream on Model.exportCsv()', () => {
    const readable = User.exportCsv();
    expect(readable).to.exist;
    expect(readable.pipe).to.exist;
  });

  it('should export csv to write stream', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.exportCsv(out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export csv to write stream with options', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const options = { sort: { updatedAt: -1 } };
    User.exportCsv(options, out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export csv to write stream with filter options', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const options = {
      filter: { name: users[0].name },
      sort: { updatedAt: -1 },
    };
    User.exportCsv(options, out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export csv to write stream with query string', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const options = {
      filter: { q: users[0].name },
      sort: { updatedAt: -1 },
    };
    User.exportCsv(options, out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export csv to write stream with falsey query string', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const options = { filter: { q: undefined }, sort: { updatedAt: -1 } };
    User.exportCsv(options, out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export query to csv', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.find().exportCsv(out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export lean query to csv', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.find()
      .lean()
      .exportCsv(out, (/* error */) => {
        readCsv((error, records) => {
          assertExport(error, records);
          done(error, records);
        });
      });
  });

  it('should export aggregate to csv', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.aggregate().exportCsv(out, (/* error */) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export aggregatables to csv', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.lookup().exportCsv(out, (/* error */) => {
      readCsv((error, records) => {
        expect(error).to.not.exist;
        expect(records).to.exist;
        const names = _.compact(
          _.map(users, (user) => _.get(user, 'parent.name'))
        );
        expect(names).to.include.members(
          _.compact(_.map(records, 'Parent Name'))
        );
        done(error, records);
      });
    });
  });

  it('should export aggregate to csv with custom exportables', (done) => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const exportables = { name: { path: 'name', header: 'Name' } };
    User.aggregate().exportCsv(out, exportables, (/* error */) => {
      readCsv((error, records) => {
        expect(error).to.not.exist;
        expect(records).to.exist;
        const names = _.map(users, 'name');
        expect(_.map(records, 'Name')).to.include.members(names);
        done(error, records);
      });
    });
  });

  after((done) => clear(done));
});
