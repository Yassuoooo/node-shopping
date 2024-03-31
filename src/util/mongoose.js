
// tạo file công cụ để xử lý chuyển đổi đối tượng từ dạng Mongoose Document => dạng đối tượng JavaScript thông thường:
module.exports = {
    // chuyển đổi nhiều đối tượng:
    mutipleMongooseToObject: function (mongooseArrays) {
        return mongooseArrays.map(mongooseArray => mongooseArray.toObject());
        // Chuyển đổi từng đối tượng course từ dạng Mongoose Document sang dạng đối tượng JavaScript thông thường
        // bằng cách sử dụng phương thức toObject():
    },

    // chuyển đổi 1 đối tượng:
    mongooseToObject: function (mongoose) {
        return mongoose ? mongoose.toObject() : mongoose;
        // nếu có đối tượng mongoose thì return lại mongoose sau khi chuyển dạng từ Mongoose Document => đối tượng JavaScript
        // nếu ko có đối tượng mongoose thì return lại mongoose
    }
};
