'use strict';


/* dependencies */
const _ = require('lodash');
const csv = require('csv');
const pump = require('pump');
const isStream = require('is-stream');
const { uniq } = require('@lykmapipo/common');
const { getNumber, getString } = require('@lykmapipo/env');
const {
  eachPath,
  isNumber,
  isString,
  isQuery,
  Query,
  Aggregate
} = require('@lykmapipo/mongoose-common');


/**
 * @function isExportable
 * @name isExportable
 * @description check if path is exportable
 * @param {SchemaType} schemaType valid path SchemaType
 * @return {Boolean} whether path is exportable
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const exportable = isExportable(schemaType); //=> true
 */
const isExportable = schemaType => _.get(schemaType, 'options.exportable');


/**
 * @function defaultValueOf
 * @name defaultValueOf
 * @description obtain exportable path default value to set if value not exists
 * @param {SchemaType} schemaType valid path SchemaType
 * @return {Boolean} exportable default value
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const defaultValue = defaultValueOf(schemaType); //=> 1
 */
const defaultValueOf = schemaType => {
  // obtain schema exportable default value
  const defaultValue = (
    _.get(schemaType, 'options.exportable.default') ||
    _.get(schemaType, 'options.default')
  );

  // obtain number schema type default value
  if (isNumber(schemaType)) {
    return (defaultValue || getNumber('NUMBER_MISSING_VALUE', 0));
  }

  // obtain string schema type default value
  if (isString(schemaType)) {
    return (defaultValue || getString('STRING_MISSING_VALUE', 'NA'));
  }

  // otherwise use undefined
  return defaultValue;
};


/**
 * @function prepareOptions
 * @name prepareOptions
 * @description prepare path exportable options
 * @param {String} pathName schema path name
 * @param {SchemaType} schemaType valid path SchemaType
 * @return {Object} exportable path options
 * @return {String} exportable.header path export header
 * @return {Number} exportable.order path export column order
 * @return {Function} exportable.format path value formatter on export
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.2.0
 * @private
 * @example
 * const options = prepareOptions(schemaType); 
 * //=> { header: 'Name', order: 1, format: (v) => v }
 */
const prepareOptions = (pathName, schemaType) => {
  // obtain export options
  let options = _.get(schemaType, 'options.exportable');
  options = _.isBoolean(options) ? {} : _.merge({}, options);

  // clone path name
  const path = _.clone(pathName);

  // prepare path header
  const header = (options.header || _.startCase(pathName));

  // prepare path order
  const order = (options.order || Number.MAX_SAFE_INTEGER);

  // prepare path default value
  const defaultValue = defaultValueOf(schemaType);

  // prepare path formatter
  const format = (value = defaultValue, instance = {}) => {
    if (_.isFunction(options.format)) {
      return (options.format(value, instance) || value);
    }
    return value;
  };

  // return path exportable options
  return { path, header, order, format };
};


/**
 * @function collectExportables
 * @name collectExportables
 * @description collect schema exportable paths recursively
 * @param {Schema} schema valid mongoose schema instance
 * @return {Object} map of all schema exportable paths
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * const exportables = collectExportables(schema);
 * //=> {...}
 */
const collectExportables = schema => {
  // exportable map
  let exportables = {};

  // collect exportable schema paths
  const collectExportable = (pathName, schemaType) => {
    // check if path is exportable
    const exportable = isExportable(schemaType);

    // collect if is exportable schema path
    if (exportable) {
      // obtain path options
      const options = prepareOptions(pathName, schemaType);

      // collect exportable path with options
      exportables[pathName] = options;
    }
  };
  eachPath(schema, collectExportable);

  // return collected schema exportable paths
  return exportables;
};


/**
 * @function mapExportablesToSelect
 * @name mapExportablesToSelect
 * @description convert exportable paths mongoose query select option
 * @param {Object} exportables valid exportables options
 * @return {Object} query select options
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * const selects = mapExportablesToSelect(exportables);
 * //=> { name: 1, age: 1 }
 */
const mapToSelect = exportables => {
  const select = {};
  const fields = uniq([..._.keys(exportables)]);
  _.forEach(fields, field => {
    select[field] = 1;
  });
  return select;
};


/**
 * @function mapInstanceToCsv
 * @name mapInstanceToCsv
 * @description transform mongoose model instance to csv exportable format
 * @param {Model} instance valid model instance
 * @param {Object} exportables valid exportables options
 * @return {Object} query select options
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.2.0
 * @private
 * const prepared = mapInstanceToCsv(user, exportables);
 * //=> { Name: 'John Doe', Age: 34 }
 */
const mapInstanceToCsv = exportables => {
  return csv.transform(instance => {
    // initialize
    let object = {};
    const fields = _.sortBy(_.values(exportables), 'order');

    // collec fields to exportable object
    _.forEach(fields, ({ path, header, format }) => {
      const val = _.get(instance, path);
      const formatted =
        _.isFunction(format) ? format(val, instance) : val;
      // handle plain object
      if (_.isPlainObject(formatted)) {
        object = _.merge({}, object, formatted);
      }
      // handle primitives
      else {
        object[header] = formatted;
      }
    });

    // escape comma if string
    _.forEach(object, (value, key) => {
      if (_.isString(value)) {
        object[key] = value.replace(/,/g, ';');
      }
    });

    // return exportabe instance
    return object;
  });
};


/**
 * @function exportable
 * @name exportable
 * @description mongoose plugin to export schema exportable fields
 * @param {Object} [optns] valid exportable plugin options
 * @param {Schema} schema valid mongoose schema
 * @return {Function} valid mongoose schema plugin
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since  0.1.0
 * @version 0.1.0
 * @public
 * @example
 * const mongoose = require('mongoose');
 * const Schema = mongoose.Schema;
 * const exportable = require('@lykmapipo/mongoose-exportable');
 * 
 * const UserSchema = new Schema({
 *  name: { type: String, exportable: true }
 *  age: { type: Number, exportable: true }
 * });
 * UserSchema.plugin(exportable);
 * const User = mongoose.model('User', UserSchema);
 *
 * //run query and export
 * User.exportCsv(); //=> ReadableStream
 * User.exportCsv({ $age: { $gte: 14 } }); //=> ReadableStream
 */
const exportablePlugin = (schema /*, optns*/ ) => {
  // prevent plugin from applied multiple times
  if (schema.statics.EXPORTABLE_FIELDS) { return; }

  /**
   * @memberOf Model
   * @constant
   * @name EXPORTABLE_FIELDS
   * @type {Object}
   * @description schema exportable fields
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.1.0
   * @version 0.1.0
   * @public
   * @static
   */
  schema.statics.EXPORTABLE_FIELDS = collectExportables(schema);

  /**
   * @memberOf Query
   * @function exportCsv
   * @name exportCsv
   * @description create csv readable stream for exporting current query data
   * @param {stream.Writable} [writeStream] valid writable stream
   * @param {Function} [done] function to invoke on export success or failure
   * @return {stream.Readable|stream.Writable} writable stream or readable stream
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.3.0
   * @version 0.1.0
   * @public
   * @example
   * 
   * const readableStream = User.find().exportCsv();
   * readableStream.pipe(...);
   * 
   */
  Query.prototype.exportCsv =
    function exportCsv( /*writeStream, cb*/ ) {
      // normalize argurments
      const args = [...arguments];
      const out = _.find(args, v => isStream(v));
      const done = _.find(args, v => !isStream(v) && _.isFunction(v));

      // select only exportable fields
      const exportables = _.merge({}, this.model.EXPORTABLE_FIELDS);
      const fields = mapToSelect(exportables);
      this.select(fields);

      // prepare exportable cursor
      let cursor = this.cursor();

      // transform data to exportable format
      const transform = mapInstanceToCsv(exportables);

      // transform exportable to strings
      const stringify = csv.stringify({ header: true });

      // collect stream for pumping i.e A->B->C etc.
      const streams = _.compact([cursor, transform, stringify, out]);
      cursor = pump(...streams, done);

      // return query cursor
      return cursor;
    };

  /**
   * @memberOf Aggregate
   * @function exportCsv
   * @name exportCsv
   * @description create csv readable stream for exporting current aggregation 
   * data
   * @param {stream.Writable} [writeStream] valid writable stream
   * @param {Object} [exportables] exportables options to override
   * @param {Function} [done] function to invoke on export success or failure
   * @return {stream.Readable|stream.Writable} writable stream or readable stream
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.3.0
   * @version 0.1.0
   * @public
   * @example
   * 
   * const readableStream = User.aggregate().exportCsv();
   * readableStream.pipe(...);
   * 
   */
  Aggregate.prototype.exportCsv =
    function exportCsv( /*writeStream, exportables, cb*/ ) {
      // normalize argurments
      const args = [...arguments];
      const options = _.find(args, v => _.isPlainObject(v));
      const out = _.find(args, v => isStream(v));
      const done = _.find(args, v => !isStream(v) && _.isFunction(v));

      // select only exportable fields
      const exportables = (
        !_.isEmpty(options) ?
        _.merge({}, options) :
        _.merge({}, this._model.EXPORTABLE_FIELDS)
      );
      const fields = mapToSelect(exportables);
      this.project(fields);

      // prepare exportable cursor
      let cursor = this.cursor().exec();

      // transform data to exportable format
      const transform = mapInstanceToCsv(exportables);

      // transform exportable to strings
      const stringify = csv.stringify({ header: true });

      // collect stream for pumping i.e A->B->C etc.
      const streams = _.compact([cursor, transform, stringify, out]);
      cursor = pump(...streams, done);

      // return query cursor
      return cursor;
    };

  /**
   * @memberOf Model
   * @function exportCsv
   * @name exportCsv
   * @description create csv readable stream for exporting model data
   * @param {stream.Writable} [writeStream] valid writable stream
   * @param {Function} [done] function to invoke on export success or failure
   * @return {stream.Readable|stream.Writable} writable stream or readable stream
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.1.0
   * @version 0.1.0
   * @public
   * @static
   * @example
   * 
   * const readableStream = User.exportCsv();
   * readableStream.pipe(...);
   * 
   */
  schema.statics.exportCsv =
    function exportCsv( /*optns, writeStream, cb*/ ) {
      // normalize argurments
      const args = [...arguments];
      const options = _.find(args, v => isQuery(v) || _.isPlainObject(v));
      const out = _.find(args, v => isStream(v));
      const done = _.find(args, v => !isStream(v) && _.isFunction(v));

      // initialize query
      let query = isQuery(options) ? options : this.find();

      // apply query options
      if (_.isPlainObject(options)) {
        const { filter = {}, sort = { updatedAt: -1 } } = options;
        const q = _.get(filter, 'q');
        const conditions = _.omit(filter, 'q');
        query = (
          _.isFunction(this.search) ?
          this.search(q, conditions) :
          this.find(conditions)
        );
        query.sort(sort);
      }

      // return query cursor
      return query.exportCsv(out, done);
    };

};


/* expose mongoose exportable plugin */
module.exports = exports = exportablePlugin;