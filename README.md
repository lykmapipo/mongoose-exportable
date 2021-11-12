# mongoose-exportable

[![Build Status](https://app.travis-ci.com/lykmapipo/mongoose-exportable.svg?branch=master)](https://app.travis-ci.com/lykmapipo/mongoose-exportable)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-exportable.svg)](https://david-dm.org/lykmapipo/mongoose-exportable)
[![Coverage Status](https://coveralls.io/repos/github/lykmapipo/mongoose-exportable/badge.svg?branch=master)](https://coveralls.io/github/lykmapipo/mongoose-exportable?branch=master)
[![GitHub License](https://img.shields.io/github/license/lykmapipo/mongoose-exportable)](https://github.com/lykmapipo/mongoose-exportable/blob/develop/LICENSE)

[![Commitizen Friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Code Style](https://badgen.net/badge/code%20style/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![npm version](https://img.shields.io/npm/v/@lykmapipo/mongoose-exportable)](https://www.npmjs.com/package/@lykmapipo/mongoose-exportable)

mongoose plugin to add exports behavior. 

## Requirements

- [NodeJS v13+](https://nodejs.org)
- [Npm v6.12+](https://www.npmjs.com/)
- [MongoDB v4+](https://www.mongodb.com/)
- [Mongoose v6+](https://github.com/Automattic/mongoose)

## Install
```sh
$ npm install --save mongoose @lykmapipo/mongoose-exportable
```

## Usage

```javascript
import mongoose from 'mongoose';
import exportable from '@lykmapipo/mongoose-exportable';

const UserSchema = new Schema({ name: { type: String, exportable: true } });
UserSchema.plugin(exportable);
const User = mongoose.model('User', UserSchema);

// fs use 
const out = fs.createWriteStream('out.csv');
User.exportCsv().pipe(out);

// express use
app.get('/users/export', (request, response) => {
    response.attachment('out.csv');
    response.status(200);
    User.exportCsv().pipe(response);
});
```

## Environment
```js
NUMBER_MISSING_VALUE=0
STRING_MISSING_VALUE=NA
```

## API

### `exportable(schema: Schema, [options: Object])`
A exportable schema plugin. Once applied to a schema will compute `exportable` paths and add [exportCsv](#exportcsvoptns-object-out-writablestream-cb-function) model `static` function.

Example
```js
const UserSchema = new Schema({ name: { type: String, exportable: true } });
UserSchema.plugin(exportable);
const User = mongoose.model('User', UserSchema);
```

### `exportCsv([optns: Object], [out: WritableStream], [cb: Function])`
Create `csv` export readable stream.

Usage with `fs`:
```js
const out = fs.createWriteStream('out.csv');
User.exportCsv().pipe(out);
```

Usage with `express`
```js
app.get('/users/export', (request, response) => {
    response.attachment('out.csv');
    response.status(200);
    User.exportCsv().pipe(response);
});
```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```
* Then run test
```sh
$ npm test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

## Licence
The MIT License (MIT)

Copyright (c) lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
