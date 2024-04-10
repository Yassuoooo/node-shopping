// Định nghĩa hàm mongooseToObject
const mongooseToObject = (data) => {
    if (Array.isArray(data)) {
        return data.map((item) => item.toObject());
    }
    return data.toObject();
};

module.exports = { mongooseToObject };
