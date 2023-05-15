const mongoose = require('mongoose');

const dbSegipConnection = async () => {
    try {
        await mongoose.connect(process.env.DB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('DB Online');

    } catch (error) {
        console.log(error);
        throw new Error('Error en la DB');
    }
}
 
module.exports = { dbSegipConnection }