// route của news:
const express = require('express');
const router = express.Router(); // khởi tạo router và gọi Router của express

const homeController = require('../app/controllers/HomeController'); 

router.get('/', homeController.index); 
// router.get('/about', homeController.about); 
// router.get('/services', homeController.services); 
// router.get('/blog', homeController.blog); 
// router.get('/contact', homeController.contact); 

module.exports = router; // export router ra ngoài để route parent là index.js có thể sử dụng
