// import thư viện mongoose của mongodb vào:
const mongoose = require('mongoose')

const Schema = mongoose.Schema 
//const ObjectId = Schema.ObjectId 

const Account = new Schema({
    // khởi tạo 1 đối tượng từ Schema
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    email: { type: String },
    role: { type: String, default: 'user' }

}, {
    timestamps: true
});

module.exports = mongoose.model('Account', Account);
