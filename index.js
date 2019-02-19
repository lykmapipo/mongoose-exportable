'use strict';


/* dependencies */
const _ = require('lodash');
const { eachPath } = require('@lykmapipo/mongoose-common');


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

  // collect exportable path
  const collectExportablePath = (pathName, schemaType) => {
    // check if path is exportable
    const isExportable =
      (schemaType.options && schemaType.options.exportable);

    // collect if is exportable schema path
    if (isExportable) {
      // obtain options
      const options = (
        _.isBoolean(schemaType.options.exportable) ? {} :
        schemaType.options.exportable
      );

      // prepare header
      const header = (options.header || _.startCase(pathName));

      // prepare column order
      const order = (options.order || Number.MAX_SAFE_INTEGER);

      // prepare formatter
      const format = (value) => {
        if (_.isFunction(options.format)) {
          return (options.format(value) || value);
        }
        return value;
      };

      // collect exportable with options
      exportables[pathName] = _.merge({}, { header, order, format });
    }
  };

  // collect exportable schema paths
  eachPath(schema, collectExportablePath);

  // return collect exportable schema paths
  return exportables;
};


/**
 * @function exportable
 * @name exportable
 * @description mongoose plugin to export schema exportable fields
 * @param {Object} [optns] valid exportable plugin options
 * @param {Schema} schema valid mongoose schema
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/regex/}
 * @see {@link https://docs.mongodb.com/manual/reference/collation/}
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/and/}
 * @see {@link https://docs.mongodb.com/manual/reference/operator/query/or/}
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
  // collect schema exportable paths
  const exportables = collectExportables(schema);

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
  schema.statics.EXPORTABLE_FIELDS = exportables;
};


/* expose mongoose exportable plugin */
module.exports = exports = exportablePlugin;