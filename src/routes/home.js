// route của news:
const express = require('express');
const router = express.Router(); // khởi tạo router và gọi Router của express

const homeController = require('../app/controllers/HomeController'); 

router.get('/', homeController.index); // truyền vào path và function handler của news

module.exports = router; // export router ra ngoài để route parent là index.js có thể sử dụng
