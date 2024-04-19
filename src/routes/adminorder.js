
const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { mongooseToObject } = require('../util/mongooseToObject');

var Order = require('../app/models/cart');


// Import middleware checkLogin
const checkLogin = require('../middleware/checklogin');
const checkAdmin = require('../middleware/checkrole');


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

/*
 * GET danh sách các đơn hàng đã lưu trong cơ sở dữ liệu
 */

// postman:
router.get('/p-order', async (req, res) => {
    try {
        const orders = await Order.find().populate('user.userId');
        res.status(200).json({ success: true, message: 'Orders fetched successfully', orders: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});


// client:
router.get('/', authenticateToken, checkLogin, checkAdmin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user.userId');
        const ordersObject = orders.map(order => ({
            _id: order._id,
            username: order.user[0].username,
            total: order.total
        }));
        res.render('admin/orders2', { title: 'Admin Orders', orders: ordersObject, isLoggedIn: req.isLoggedIn, layout: 'adminmain' });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



/*
 * GET trang chi tiết đơn hàng
 */

// postman:
router.get('/p-orders/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('user.userId');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// client:
router.get('/:orderId', authenticateToken, checkLogin, checkAdmin, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate('user.userId');
        const orderObject = mongooseToObject(order);
        res.render('admin/orderdetails2', { title: 'Order Detail', order: orderObject, isLoggedIn: req.isLoggedIn, layout: 'adminmain' });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Exports
module.exports = router;
