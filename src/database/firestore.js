//FIREBASE LIBS
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
//FIREBASE AUTH KEYS
const serviceAccount = require("../../ServiceAccountFirebase.json");
//FIREBASE INITIALIZATION
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;