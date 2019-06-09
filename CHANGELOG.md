#### 0.3.4 (2019-06-09)

##### Chores

* **deps:**  force latest version & audit fix ([d6ab8505](https://github.com/lykmapipo/mongoose-exportable/commit/d6ab85056637a0b59ac23fc27c986b3046df3453))

#### 0.3.3 (2019-05-30)

##### Chores

* **deps:**  force latest version & audit fix ([021063e0](https://github.com/lykmapipo/mongoose-exportable/commit/021063e035ec95fab130e94b82d584e58cb4ceea))

##### Bug Fixes

*  prevent exportable fields overrides ([30d45e69](https://github.com/lykmapipo/mongoose-exportable/commit/30d45e6931515d79ba91083f5170efb1f6165f8d))

#### 0.3.2 (2019-05-20)

##### Chores

* **deps:**  force latest version & audit fix ([7dba075e](https://github.com/lykmapipo/mongoose-exportable/commit/7dba075ebf244f02bd74f751c57a1372e52a1295))

#### 0.3.1 (2019-05-19)

##### Bug Fixes

*  escape comma using semi colon ([a2c3d34d](https://github.com/lykmapipo/mongoose-exportable/commit/a2c3d34defd1ef096882b02b56b6969bb6b93804))

#### 0.3.0 (2019-05-12)

##### Chores

* **deps:**  force latest version & audit fix ([5c427f5d](https://github.com/lykmapipo/mongoose-exportable/commit/5c427f5df1d68ea15797977ac0eeba64248c359e))

##### Documentation Changes

*  add missing environment variables ([f068160f](https://github.com/lykmapipo/mongoose-exportable/commit/f068160f40b278ebdb4e8314935f8b5fe078fcd9))

##### New Features

*  allow aggregatable refs to be expotable ([7f7e758e](https://github.com/lykmapipo/mongoose-exportable/commit/7f7e758e5f0dddafffd9c7e1b18270e7bb1b7369))
*  allow custom exportables on aggregate exportCsv ([d60ed41f](https://github.com/lykmapipo/mongoose-exportable/commit/d60ed41f21d48bf0c4247d21dae28bd4b9e359df))
*  implement aggregate exportCsv ([884d71b0](https://github.com/lykmapipo/mongoose-exportable/commit/884d71b036f6869c98c9287c25e15c5bf5ebacba))
*  add exportCsv into query ([de98f995](https://github.com/lykmapipo/mongoose-exportable/commit/de98f995bd327a53036419c284200e81f200664f))
*  allow merging plain object formatted values for export ([f5875824](https://github.com/lykmapipo/mongoose-exportable/commit/f5875824557d20f96c665cec664832effd60d9a4))
*  pass instance on exportable format function ([6abaf2b8](https://github.com/lykmapipo/mongoose-exportable/commit/6abaf2b887929a35469426e58388090bc077f47a))

##### Refactors

*  use query.exportCsv in Model.exportCsv ([801950fe](https://github.com/lykmapipo/mongoose-exportable/commit/801950fed0df50ccc3cadfa16b1866e35eff08a5))

##### Tests

*  refactor to use include.members than eql in arrays assertions ([b20fe463](https://github.com/lykmapipo/mongoose-exportable/commit/b20fe463ed2c33cb55240d628f0d57493c025bb2))
*  improve lean query exports ([c1dfd720](https://github.com/lykmapipo/mongoose-exportable/commit/c1dfd720f98a6de3154d14bbce8e6d18d9acd2aa))
*  improver plain object exportable formatter specs ([84dc7d32](https://github.com/lykmapipo/mongoose-exportable/commit/84dc7d32de8b9b5e542bffff04fcad7e52b2b244))
*  refactor to use mongoose-test-helpers ([ad04517b](https://github.com/lykmapipo/mongoose-exportable/commit/ad04517bace319917add80074a12dac237334a04))
*  assert passed instance on exportable format ([3a3c7c0d](https://github.com/lykmapipo/mongoose-exportable/commit/3a3c7c0d044618457656f03c451bc5c279df36ce))

#### 0.2.2 (2019-05-01)

##### Chores

* **ci:**  force latest nodejs ([b5beef56](https://github.com/lykmapipo/mongoose-exportable/commit/b5beef56cb5cba6525b0e72b225eb671ff428e59))
* **.npmrc:**  prevent npm version to commit and tag version ([aefc4d27](https://github.com/lykmapipo/mongoose-exportable/commit/aefc4d27fab31283e7473ee877bebd651444b63e))
* **deps:**  force latest version & audit fix ([7d0f7d7b](https://github.com/lykmapipo/mongoose-exportable/commit/7d0f7d7b346ac15b08d7dd0f06783a1779693d48))

#### 0.2.1 (2019-04-16)

##### Documentation Changes

*  add code of conduct & contributing guide ([18d69995](https://github.com/lykmapipo/mongoose-exportable/commit/18d699952ae4db4450789f2ee58b7a68c6d07c90))

##### Bug Fixes

*  clear rest property error && force latest dependencies ([e0b63ec2](https://github.com/lykmapipo/mongoose-exportable/commit/e0b63ec29b854c0a74b5a3b61d24c12ac456a5b4))

#### 0.2.0 (2019-02-21)

##### New Features

*  apply options on export query ([b8aa10a0](https://github.com/lykmapipo/mongoose-exportable/commit/b8aa10a0c710013c45285b47ac468b8a9ff92ed2))

#### 0.1.0 (2019-02-21)

##### Chores

*  update package keywords ([63f5548d](https://github.com/lykmapipo/mongoose-exportable/commit/63f5548d60c608aed83048ca0ccfffee261d123e))

##### Documentation Changes

*  remove WIP flag ([7bfb5de4](https://github.com/lykmapipo/mongoose-exportable/commit/7bfb5de4fee61509353f2adcbdd760ea612d4201))
*  update usage docs ([1d284f82](https://github.com/lykmapipo/mongoose-exportable/commit/1d284f821955148386bb0c290c87bce02e928429))
*  fix description typos ([165606fa](https://github.com/lykmapipo/mongoose-exportable/commit/165606fa072c1ba177949de87cd2a1ae5e1b4f88))

##### New Features

*  implement exportCsv zero draft ([50ad5ce0](https://github.com/lykmapipo/mongoose-exportable/commit/50ad5ce03339131ad495f6307a47d4b4a135cd30))
*  apply sensible field/column export options ([5f296123](https://github.com/lykmapipo/mongoose-exportable/commit/5f296123c29990fcacfa97e10e3c50882a053036))
*  collect schema exportable fields ([e9b6b721](https://github.com/lykmapipo/mongoose-exportable/commit/e9b6b721575ec1b826ed29e5f9cb8f8a9e326c3c))

##### Refactors

*  extract csv transform from exportCsv ([4067de92](https://github.com/lykmapipo/mongoose-exportable/commit/4067de9236efe52b351497c0dc145f4934dcaa7c))
*  split collectExportables to helpers ([ed4a7245](https://github.com/lykmapipo/mongoose-exportable/commit/ed4a7245b2dd9da9163f8e0bc8f807de1e8227b8))

