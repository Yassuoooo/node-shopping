
const express = require('express');
const router = express.Router(); // khởi tạo router và gọi Router của express


const authenticateToken = require('../middleware/checkauthen');
const checkLogin = require('../middleware/checklogin');


const homeController = require('../app/controllers/HomeController'); 
const productController = require('../app/controllers/ProductController'); 
const cartController = require('../app/controllers/CartController'); 
const accountController = require('../app/controllers/AccountController'); 


// Page:
router.get('/home', authenticateToken, homeController.gethome); 
router.get('/category/:slug', authenticateToken, homeController.getproductbycategory); 
router.get('/contact-us', authenticateToken, homeController.getcontact); 
router.get('/blog-slug', authenticateToken, homeController.getblog); 
router.get('/services-slug', authenticateToken, homeController.getservice); 
router.get('/about-us', authenticateToken, homeController.getabout); 


// Product:
router.get('/product', authenticateToken, productController.getproduct); 
router.get('/product/category/:slug', authenticateToken, productController.getproductbycategory); 
router.get('/product/:product', authenticateToken, productController.getproductdetails); 


// Cart:
router.get('/add/:product', checkLogin, cartController.getaddproducttocart); 
router.get('/checkout', authenticateToken, checkLogin, cartController.getcartpage); 
router.post('/update/:product', authenticateToken, checkLogin, cartController.postupdatecart); 
router.get('/clear', checkLogin, cartController.getclearcart); 
router.get('/buynow', checkLogin, cartController.getbuynow); 
router.post('/checkout2', checkLogin, cartController.postodertodb); 
router.get('/order_success', authenticateToken, checkLogin, cartController.getordersuccess); 


// Account:
router.get('/login', accountController.getloginpage); 
router.post('/login', accountController.postlogin); 
router.get('/register', accountController.getregisterpage); 
router.post('/register', accountController.postregister); 
router.get('/account-info', accountController.getaccountinfo); 
router.get('/notpermitted', accountController.getnotpermitted); 
router.get('/login_required', accountController.getloginrequired); 
router.get('/logout', accountController.getlogout); 



module.exports = router; 
