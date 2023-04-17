let mongoose = require('mongoose');


let medicineSchema = mongoose.Schema({
    medicine: {
        type: String,
        required: true
    },
    doctorname: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Medicine', medicineSchema);