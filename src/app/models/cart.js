
const mongoose = require('mongoose')
const Schema = mongoose.Schema 
const ObjectId = Schema.ObjectId 

const Cart = new Schema({
    products: [
        {
            title: { type: String, required: true },
            qty: { type: Number },
            price: { type: Number, required: true },
            image: { type: String },
            product_id: { type: Schema.Types.ObjectId, ref: 'Product' } // ObjectId của sản phẩm trong bảng products
        }
    ],
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', Cart); 