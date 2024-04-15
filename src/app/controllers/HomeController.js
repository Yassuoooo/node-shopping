const express = require('express');
const router = express.Router();

var Product = require('../../app/models/product');

const productRouter = require('../../routes/product'); // Đường dẫn tới file xử lý product

class HomeController {
    // function constructor

    // GET /news: cấu hình cho route news
    index(req, res) {
        res.render('home', {
            layout: 'main'
        });
    }

}

module.exports = new HomeController(); 
