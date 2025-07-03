const admin = require('firebase-admin');
const path = require('path');

// Lee el archivo desde la raíz del backend
const serviceAccount = require(path.resolve(__dirname, '../../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
