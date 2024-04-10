
const mongoose = require('mongoose')
const Schema = mongoose.Schema 
const ObjectId = Schema.ObjectId 

const Product = new Schema({
    title: { type: String, required: true },
    slug: { type: String },
    desc: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', Product); 