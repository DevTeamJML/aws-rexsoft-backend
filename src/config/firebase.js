const serviceAccount = require("./service-account.json");

const admin = require("firebase-admin");
const firebaseDb = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

exports.firebaseAuth = admin.auth(firebaseDb);
exports.messaging = admin.messaging();
