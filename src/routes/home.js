// route của news:
const express = require('express');
const router = express.Router(); // khởi tạo router và gọi Router của express

const productRouter = require('./product'); // Đường dẫn tới file xử lý product

const homeController = require('../app/controllers/HomeController'); 

//router.get('/', homeController.index); 
// router.get('/about', homeController.about); 
// router.get('/services', homeController.services); 
// router.get('/blog', homeController.blog); 
// router.get('/contact', homeController.contact); 

//module.exports = router; 
