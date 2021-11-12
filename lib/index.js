'use strict';

const _ = require('lodash');
const csv = require('csv');
const pump = require('pump');
const common = require('@lykmapipo/common');
const env = require('@lykmapipo/env');
const mongooseCommon = require('@lykmapipo/mongoose-common');

const isStream = (stream) => {
  return (
    stream !== null &&
    typeof stream === 'object' &&
    typeof stream.pipe === 'function'
  );
};

/**
 * @function isExportable
 * @name isExportable
 * @description check if path is exportable
 * @param {object} schemaType valid path SchemaType
 * @returns {boolean} whether path is exportable
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const exportable = isExportable(schemaType); //=> true
 */
const isExportable = (schemaType) => _.get(schemaType, 'options.exportable');

/**
 * @function defaultValueOf
 * @name defaultValueOf
 * @description obtain exportable path default value to set if value not exists
 * @param {object} schemaType valid path SchemaType
 * @returns {boolean} exportable default value
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const defaultValue = defaultValueOf(schemaType); //=> 1
 */
const defaultValueOf = (schemaType) => {
  // obtain schema exportable default value
  const defaultValue =
    _.get(schemaType, 'options.exportable.default') ||
    _.get(schemaType, 'options.default');

  // obtain number schema type default value
  if (mongooseCommon.isNumber(schemaType)) {
    return defaultValue || env.getNumber('NUMBER_MISSING_VALUE', 0);
  }

  // obtain string schema type default value
  if (mongooseCommon.isString(schemaType)) {
    return defaultValue || env.getString('STRING_MISSING_VALUE', 'NA');
  }

  // otherwise use undefined
  return defaultValue;
};

/**
 * @function prepareOptions
 * @name prepareOptions
 * @description prepare path exportable options
 * @param {string} pathName schema path name
 * @param {object} schemaType valid path SchemaType
 * @returns {object} exportable path options
 *  String `exportable.header` for path export header
 *  Number `exportable.order` for path export column order
 *  Function `exportable.format` for path value formatter on export
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
  const header = options.header || _.startCase(pathName);

  // prepare path order
  const order = options.order || Number.MAX_SAFE_INTEGER;

  // prepare path default value
  const defaultValue = defaultValueOf(schemaType);

  // prepare path formatter
  const format = (value = defaultValue, instance = {}) => {
    // ensure value
    const val = _.isFunction(value) ? value() : value;

    // format value with path formatter
    if (_.isFunction(options.format)) {
      return options.format(val, instance) || val;
    }

    // return value
    return val;
  };

  // return path exportable options
  return { path, header, order, format };
};

/**
 * @function collectExportables
 * @name collectExportables
 * @description collect schema exportable paths recursively
 * @param {object} schema valid mongoose schema instance
 * @returns {object} map of all schema exportable paths
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const exportables = collectExportables(schema);
 * //=> {...}
 */
const collectExportables = (schema) => {
  // exportable map
  const exportables = {};

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
  mongooseCommon.eachPath(schema, collectExportable);

  // return collected schema exportable paths
  return exportables;
};

/**
 * @function mapExportablesToSelect
 * @name mapExportablesToSelect
 * @description convert exportable paths mongoose query select option
 * @param {object} exportables valid exportables options
 * @returns {object} query select options
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.1.0
 * @private
 * @example
 * const selects = mapExportablesToSelect(exportables);
 * //=> { name: 1, age: 1 }
 */
const mapToSelect = (exportables) => {
  const select = {};
  const fields = common.uniq([..._.keys(exportables)]);
  _.forEach(fields, (field) => {
    select[field] = 1;
  });
  return select;
};

/**
 * @function mapInstanceToCsv
 * @name mapInstanceToCsv
 * @description transform mongoose model instance to csv exportable format
 * @param {object} exportables valid exportables options
 * @returns {object} query select options
 * @author lally elias <lallyelias87@mail.com>
 * @license MIT
 * @since 0.1.0
 * @version 0.2.0
 * @private
 * @example
 * const prepared = mapInstanceToCsv(user, exportables);
 * //=> { Name: 'John Doe', Age: 34 }
 */
const mapInstanceToCsv = (exportables) => {
  return csv.transform((instance) => {
    // initialize
    let object = {};
    const fields = _.sortBy(_.values(exportables), 'order');

    // collec fields to exportable object
    _.forEach(fields, ({ path, header, format }) => {
      const val = _.get(instance, path);
      const formatted = _.isFunction(format) ? format(val, instance) : val;
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
 * @param {object} schema valid mongoose schema
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
const exportablePlugin = (schema) => {
  // prevent plugin from applied multiple times
  if (schema.statics.EXPORTABLE_FIELDS) {
    return;
  }

  /**
   * @memberof Model
   * @constant
   * @name EXPORTABLE_FIELDS
   * @type {object}
   * @description schema exportable fields
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.1.0
   * @version 0.1.0
   * @public
   * @static
   */
  // eslint-disable-next-line no-param-reassign
  schema.statics.EXPORTABLE_FIELDS = collectExportables(schema);

  /**
   * @memberof Query
   * @function exportCsv
   * @name exportCsv
   * @description create csv readable stream for exporting current query data
   * @param {object} [writeStream] valid writable stream
   * @param {Function} [cb] function to invoke on export success or failure
   * @returns {object} writable stream or readable stream
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.3.0
   * @version 0.1.0
   * @public
   * @example
   *
   * const readableStream = User.find().exportCsv();
   * readableStream.pipe(...);
   */
  mongooseCommon.Query.prototype.exportCsv = function exportCsv(writeStream, cb) {
    // normalize argurments
    const args = [writeStream, cb];
    const out = _.find(args, (v) => isStream(v));
    const done = _.find(args, (v) => !isStream(v) && _.isFunction(v));

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
   * @memberof Aggregate
   * @function exportCsv
   * @name exportCsv
   * @description create csv readable stream for exporting current aggregation
   * data
   * @param {object} [optns] exportables options to override
   * @param {object} [writeStream] valid writable stream
   * @param {Function} [cb] function to invoke on export success or failure
   * @returns {object} writable stream or readable stream
   * @author lally elias <lallyelias87@mail.com>
   * @license MIT
   * @since 0.3.0
   * @version 0.1.0
   * @public
   * @example
   *
   * const readableStream = User.aggregate().exportCsv();
   * readableStream.pipe(...);
   */
  mongooseCommon.Aggregate.prototype.exportCsv = function exportCsv(optns, writeStream, cb) {
    // normalize argurments
    const args = [writeStream, optns, cb];
    const options = _.find(args, (v) => _.isPlainObject(v));
    const out = _.find(args, (v) => isStream(v));
    const done = _.find(args, (v) => !isStream(v) && _.isFunction(v));

    // select only exportable fields
    const exportables = !_.isEmpty(options)
      ? _.merge({}, options)
      : // eslint-disable-next-line no-underscore-dangle
        _.merge({}, this._model.EXPORTABLE_FIELDS);
    const fields = mapToSelect(exportables);
    this.project(fields);

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
   * @memberof Model
   * @function exportCsv
   * @name exportCsv
   * @description create csv readable stream for exporting model data
   * @param {object} [optns] exportables options to override
   * @param {object} [writeStream] valid writable stream
   * @param {Function} [cb] function to invoke on export success or failure
   * @returns {object} writable stream or readable stream
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
   */
  // eslint-disable-next-line no-param-reassign
  schema.statics.exportCsv = function exportCsv(optns, writeStream, cb) {
    // normalize argurments
    const args = [optns, writeStream, cb];
    const options = _.find(args, (v) => mongooseCommon.isQuery(v) || _.isPlainObject(v));
    const out = _.find(args, (v) => isStream(v));
    const done = _.find(args, (v) => !isStream(v) && _.isFunction(v));

    // initialize query
    let query = mongooseCommon.isQuery(options) ? options : this.find();

    // apply query options
    if (_.isPlainObject(options)) {
      const { filter = {}, sort = { updatedAt: -1 } } = options;
      const q = _.get(filter, 'q');
      const conditions = _.omit(filter, 'q');
      query = _.isFunction(this.search)
        ? this.search(q, conditions)
        : this.find(conditions);
      query.sort(sort);
    }

    // return query cursor
    return query.exportCsv(out, done);
  };
};

module.exports = exportablePlugin;
