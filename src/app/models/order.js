
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Order= new Schema({
    products: [
        {
            title: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            image: { type: String }
        }
    ],
    total: { type: Number, required: true },
    user: [
        {
            username: { type: String, required: true },
            email: { type: String, required: true }
        }
    ]
    // username: { type: String, required: true },
});

module.exports = mongoose.model('Order', Order); 
