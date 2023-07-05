//FIREBASE LIBS
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

//FIREBASE AUTH KEYS

const serviceAccount = require("../../sebas2023-7eb58-firebase-adminsdk-rcna8-0e0dd0713b.json");
//FIREBASE INITIALIZATION
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = {
    db: db
};