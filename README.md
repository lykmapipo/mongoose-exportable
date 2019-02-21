# mongoose-exportable

[![Build Status](https://travis-ci.org/lykmapipo/mongoose-exportable.svg?branch=master)](https://travis-ci.org/lykmapipo/mongoose-exportable)
[![Dependencies Status](https://david-dm.org/lykmapipo/mongoose-exportable/status.svg)](https://david-dm.org/lykmapipo/mongoose-exportable)

mongoose plugin to add exports behavior. 

## Requirements

- NodeJS v9.3+

## Install
```sh
$ npm install --save @lykmapipo/mongoose-exportable
```

## Usage

```javascript
const mongoose = require('mongoose');
const exportable = require('@lykmapipo/mongoose-exportable');

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

Copyright (c) 2019 lykmapipo & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 