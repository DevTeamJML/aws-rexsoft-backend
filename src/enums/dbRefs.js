const { firebaseDB } = require('../config/firebase');

const ref = firebaseDB.ref();
const tokenRef = (path) => ref.child(`token${path}`);

module.exports = {
  tokenRef,
};
