


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SignUpSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
   
});



const SignUp = mongoose.model('Signup', SignUpSchema);
module.exports = SignUp;
