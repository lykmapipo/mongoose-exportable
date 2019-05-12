'use strict';


/* dependencies */
const { createWriteStream } = require('fs');
const _ = require('lodash');
const { include } = require('@lykmapipo/include');
const {
  clear,
  create,
  expect,
  createTestModel,
  // enableDebug,
  // disableDebug
} = require('@lykmapipo/mongoose-test-helpers');
const aggregatable = require('@lykmapipo/mongoose-aggregatable');
const csv2array = require('csv-to-array');
const exportable = include(__dirname, '..');

const readCsv = done =>
  csv2array({ file: `${__dirname}/fixtures/out.csv`, columns: true }, done);

const schema = include(__dirname, 'test.schema');
const User =
  createTestModel(schema, { modelName: 'User' }, aggregatable, exportable);


describe('mongoose-exportable', () => {
  let users = User.fake(3);
  users[1].parent = users[0];
  users[2].parent = users[0];

  before(done => clear(done));

  before(done => create(...users, done));

  const assertExport = (error, records) => {
    expect(error).to.not.exist;
    expect(records).to.exist;

    const names = _.map(users, 'name');
    const ages = _.map(users, 'age');
    const statuses = _.map(users, 'status');

    expect(_.map(records, 'Name')).to.include.members(names);
    expect(_.map(records, 'Status Name')).to.include.members(statuses);
    expect(_.map(records, v => Number(v.Age))).to.include.members(ages);
  };

  it('should navigate paths and build exportable fields', () => {
    expect(User.EXPORTABLE_FIELDS).to.exist;
    expect(User.EXPORTABLE_FIELDS).to.be.an('object');
    expect(User.EXPORTABLE_FIELDS).to.have.property('age');
    expect(User.EXPORTABLE_FIELDS).to.have.property('name');
    expect(User.EXPORTABLE_FIELDS).to.have.property('contact.phone');
    expect(User.EXPORTABLE_FIELDS).to.have.property('titles');
    expect(User.EXPORTABLE_FIELDS)
      .to.not.have.property('contact.email');
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

  it('should export csv to write stream', done => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.exportCsv(out, ( /*error*/ ) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export csv to write stream with options', done => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const options = { sort: { updatedAt: -1 } };
    User.exportCsv(options, out, ( /*error*/ ) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export query to csv', done => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.find().exportCsv(out, ( /*error*/ ) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export lean query to csv', done => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.find().lean().exportCsv(out, ( /*error*/ ) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export aggregate to csv', done => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    User.aggregate().exportCsv(out, ( /*error*/ ) => {
      readCsv((error, records) => {
        assertExport(error, records);
        done(error, records);
      });
    });
  });

  it('should export aggregate to csv with custom exportables', done => {
    const out = createWriteStream(`${__dirname}/fixtures/out.csv`);
    const exportables = { name: { path: 'name', header: 'Name' } };
    User.aggregate().exportCsv(out, exportables, ( /*error*/ ) => {
      readCsv((error, records) => {
        expect(error).to.not.exist;
        expect(records).to.exist;
        const names = _.map(users, 'name');
        expect(_.map(records, 'Name')).to.include.members(names);
        done(error, records);
      });
    });
  });

  after(done => clear(done));
});