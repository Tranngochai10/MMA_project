// Invoked only by the reviewed local setup script, after its cold backup.
const { MongoClient } = require('mongoose').mongo;
const fs = require('fs');
const path = require('path');
async function main() {
  const client = new MongoClient('mongodb://127.0.0.1:27017/?directConnection=true', { serverSelectionTimeoutMS: 10000 });
  try {
    await client.connect();
    const admin = client.db('admin');
    await admin.command({ replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] } });
    let ready = false;
    for (let i = 0; i < 30; i++) {
      if ((await admin.command({ hello: 1 })).isWritablePrimary) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!ready) throw new Error('Local replica set did not elect a primary.');
    const envPath = path.join(__dirname, '..', '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    const updated = env.replace(/^(MONGODB_URI=)(.*)$/m, (line, prefix, uri) => {
      if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)(:27017)?\//.test(uri.trim())) throw new Error('Unexpected MongoDB URI; refusing to replace it.');
      if (/[?&]replicaSet=/.test(uri)) return line;
      return prefix + uri.trim() + (uri.includes('?') ? '&' : '?') + 'replicaSet=rs0';
    });
    fs.writeFileSync(envPath, updated, 'utf8');
    console.log('Local replica set rs0 ready; backend connection configuration updated.');
  } finally { await client.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
