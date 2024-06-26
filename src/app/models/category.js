
const mongoose = require('mongoose')
const Schema = mongoose.Schema 
const ObjectId = Schema.ObjectId 

const Category = new Schema({
    title: { type: String, required: true },
    slug: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', Category); 