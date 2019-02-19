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

  after(done => clear(done));
});