const express = require('express');
const router = express.Router();
const adminController = require('../app/controllers/AdminController'); 

router.get('/', adminController.index);

module.exports = router; // export router ra ngoài để route parent là index.js có thể sử dụng







