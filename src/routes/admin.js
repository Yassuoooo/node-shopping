
const express = require('express');
const router = express.Router(); // khởi tạo router và gọi Router của express

// Import middleware checkLogin
// const authenticateToken = require('../middleware/checkauthen');
const checkLogin = require('../middleware/checklogin');
const checkAdmin = require('../middleware/checkrole');

const adminController = require('../app/controllers/AdminController');


// Admin home:
router.get('/home', checkLogin, checkAdmin, adminController.gethome);


// Admin page:
router.get('/pages', checkLogin, checkAdmin, adminController.getpage);
router.get('/add-page', checkLogin, checkAdmin, adminController.getaddpage);
router.post('/add-page', checkLogin, checkAdmin, adminController.postaddpage);
router.get('/edit-page/:id', checkLogin, checkAdmin, adminController.geteditpage);
router.put('/edit-page/:id', checkLogin, checkAdmin, adminController.puteditpage);
router.delete('/delete-page/:id', checkLogin, checkAdmin, adminController.deletepage);


// Admin category:
router.get('/categories', checkLogin, checkAdmin, adminController.getcategory);
router.get('/add-category', checkLogin, checkAdmin, adminController.getaddcategory);
router.post('/add-category', checkLogin, checkAdmin, adminController.postaddcategory);
router.get('/edit-category/:id', checkLogin, checkAdmin, adminController.geteditcategory);
router.put('/edit-category/:id', checkLogin, checkAdmin, adminController.puteditcategory);
router.delete('/delete-category/:id', checkLogin, checkAdmin, adminController.deletecategory);


// Admin product:
router.get('/products', checkLogin, checkAdmin, adminController.getproduct);
router.get('/add-product', checkLogin, checkAdmin, adminController.getaddproduct);
router.post('/add-product', checkLogin, checkAdmin, adminController.postaddproduct);
router.get('/edit-product/:id', checkLogin, checkAdmin, adminController.geteditproduct);
router.put('/edit-product/:id', checkLogin, checkAdmin, adminController.puteditproduct);
router.delete('/delete-product/:id', checkLogin, checkAdmin, adminController.deleteproduct);


// Admin user:
router.get('/users', checkLogin, checkAdmin, adminController.getuser);
router.get('/edit-user/:id', checkLogin, checkAdmin, adminController.getedituser);
router.put('/edit-user/:id', checkLogin, checkAdmin, adminController.putedituser);
router.delete('/delete-user/:id', checkLogin, checkAdmin, adminController.deleteuser);


// Admin order:
router.get('/orders', checkLogin, checkAdmin, adminController.getorder);
router.get('/oder-details/:orderId', checkLogin, checkAdmin, adminController.getorderdetails);

module.exports = router; 
