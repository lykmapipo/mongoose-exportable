'use strict';


/* dependencies */
const { expect } = require('chai');
const { include } = require('@lykmapipo/include');
const { model, Schema } = require('@lykmapipo/mongoose-common');
const { clear } = require('@lykmapipo/mongoose-test-helpers');
const exportable = include(__dirname, '..');


const PersonSchema = new Schema({
  age: { type: Number, index: true, exportable: true },
  name: {
    firstName: { type: String, index: true, exportable: true },
    surname: { type: String, index: true, exportable: true }
  },
  titles: {
    type: [String],
    index: true,
    exportable: { header: 'Titles' }
  }
});
PersonSchema.plugin(exportable);
const Person = model('Person', PersonSchema);


describe('mongoose-exportable', () => {
  before(done => clear(done));

  it('should navigate paths and build exportable fields', () => {
    expect(Person.EXPORTABLE_FIELDS).to.exist;
    expect(Person.EXPORTABLE_FIELDS).to.be.an('object');

    //assert exportable fields
    expect(Person.EXPORTABLE_FIELDS).to.have.property('age');
    expect(Person.EXPORTABLE_FIELDS).to.have.property('name.firstName');
    expect(Person.EXPORTABLE_FIELDS).to.have.property('name.surname');
  });

  it('should set default exportable field options', () => {
    const { age } = Person.EXPORTABLE_FIELDS;
    expect(age.header).to.be.equal('Age');
    expect(age.order).to.be.equal(Number.MAX_SAFE_INTEGER);
    expect(age.format).to.be.a('function');
    expect(age.format(4)).to.be.equal(4);
  });

  after(done => clear(done));
});