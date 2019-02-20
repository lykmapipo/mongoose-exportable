'use strict';


/* dependencies */
const _ = require('lodash');
const { getNumber, getString } = require('@lykmapipo/env');
const { eachPath, isNumber, isString } = require('@lykmapipo/mongoose-common');


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
 * @version 0.1.0
 * @private
 * @example
 * const options = prepareOptions(schemaType); 
 * //=> { header: 'Name', order: 1, format: (v) => v }
 */
const prepareOptions = (pathName, schemaType) => {
  // obtain export options
  let options = _.get(schemaType, 'options.exportable');
  options = _.isBoolean(options) ? {} : _.merge({}, options);

  // prepare path header
  const header = (options.header || _.startCase(pathName));

  // prepare path order
  const order = (options.order || Number.MAX_SAFE_INTEGER);

  // prepare path default value
  const defaultValue = defaultValueOf(schemaType);

  // prepare path formatter
  const format = (value = defaultValue) => {
    if (_.isFunction(options.format)) {
      return (options.format(value) || value);
    }
    return value;
  };

  // return path exportable options
  return { header, order, format };
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
 * User.export(); //=> ReadableStream
 * User.export({ $age: { $gte: 14 } }); //=> ReadableStream
 */
const exportablePlugin = (schema /*, optns*/ ) => {
  /**
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
};


/* expose mongoose exportable plugin */
module.exports = exports = exportablePlugin;