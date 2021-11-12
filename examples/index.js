import fs from 'fs';
import { connect, model, Schema } from '@lykmapipo/mongoose-common';
import exportable from '../src';

const UserSchema = new Schema({ name: { type: String, exportable: true } });
UserSchema.plugin(exportable);
const User = model('User', UserSchema);

// fs use
connect(() => {
  const out = fs.createWriteStream('out.csv');
  User.exportCsv().pipe(out);
});
