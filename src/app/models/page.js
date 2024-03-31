
const mongoose = require('mongoose')

//const slug = require('mongoose-slug-updater');
//mongoose.plugin(slug);

const Schema = mongoose.Schema 
const ObjectId = Schema.ObjectId 

const Page = new Schema({
    title: { type: String, required: true },
    slug: { type: String },
    content: { type: String, required: true },
    sorting: { type: Number },
}, {
    timestamps: true
});

module.exports = mongoose.model('Page', Page); 
