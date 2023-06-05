const { configObj } = require("../../firebaseConfigObj");

//FIREBASE STORAGE LIB
const { getStorage } = require('firebase/storage');
const { initializeApp } = require('firebase/app');

const app = initializeApp(configObj);
const storage = getStorage(app);

module.exports = {
    storage: storage
};





