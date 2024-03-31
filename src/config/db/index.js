// import thư viện mongoose của mongodb vào:
const mongoose = require('mongoose')

// Tạo hàm để connect db trong mongodb:
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/shopping') // dùng mongoose để kết nối
        console.log('Connected to MongoDB')
    } catch (e) {
        console.log('Failed to connect: ', e)
    }
}

module.exports = { connect } // export hàm connect ra ngoài dưới dạng object để sử dụng
