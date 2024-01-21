const admin = require('firebase-admin')
const serviceAccount = require('./config/finhelpapp-6885b-firebase-adminsdk-yqktk-ec43c4bf68.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://finhelpapp-6885b-default-rtdb.firebaseio.com"
});

const config = admin.remoteConfig();
const store = admin.firestore();

exports.config = config;
exports.store = store;
