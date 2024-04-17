const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const adminController = require('../app/controllers/AdminController'); 

const checkLogin = require('../middleware/checklogin');
const checkAdminHome = require('../middleware/checkrole');

// router.get('/', checkLogin, checkAdminHome, adminController.index);

function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (token) {
        try {
            const decodedToken = jwt.verify(token, 'pass');
            req.accountId = decodedToken._id; // Lưu id của người dùng vào request để sử dụng trong các route sau
            req.isLoggedIn = true; // Đánh dấu người dùng đã đăng nhập
        } catch (error) {
            console.error(error);
        }
    } else {
        req.isLoggedIn = false; // Đánh dấu người dùng chưa đăng nhập
    }

    // Tiếp tục middleware dù có token hay không
    next();
}

router.get('/', authenticateToken, checkLogin, checkAdminHome, (req, res) => {  
    res.render('admin/adminhome2', {
        isLoggedIn: req.isLoggedIn,
        layout: 'adminmain'
    });
});


module.exports = router; // export router ra ngoài để route parent là index.js có thể sử dụng







