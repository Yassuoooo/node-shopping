
const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { mongooseToObject } = require('../util/mongooseToObject');


// Get Product model
var Product = require('../app/models/product');
var Order = require('../app/models/cart');
const AccountModel = require('../app/models/account');


// Import middleware checkLogin
const checkLogin = require('../middleware/checklogin');


// Middleware để kiểm tra token và xác minh người dùng đã đăng nhập hay chưa
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
 * GET add product to cart
 */
router.get('/add/:product', checkLogin, async (req, res) => {
    try {
        var slug = req.params.product;
        var p = await Product.findOne({ slug: slug });

        if (!p) {
            // Xử lý khi không tìm thấy sản phẩm
            console.log("Product not found");
            return res.status(404).send("Product not found");
        }

        // Lấy userId và username từ middleware checkLogin
        const userId = req.userId;
        const username = req.username;
        const email = req.email;


        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image,
                product_id: p._id, // Thêm trường product_id với ObjectId của sản phẩm
                userId: userId, // Lưu userId vào thông tin giỏ hàng
                username: username, // Lưu username vào thông tin giỏ hàng
                email: email
            });
            console.log('first session: ', req.session);
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image,
                    product_id: p._id, // Thêm trường product_id với ObjectId của sản phẩm
                    userId: userId, // Lưu userId vào thông tin giỏ hàng
                    username: username, // Lưu username vào thông tin giỏ hàng
                    email: email
                });
                //console.log('session updated1: ', req.session);

            }
        }
        // Trả về mã JavaScript để hiển thị cảnh báo
        res.send(`
            <script>
                alert('Product added to cart!');
                window.location.href = '/products';
            </script>
        `);
        //res.redirect('back');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});


/*
 * GET checkout page
 */

router.get('/checkout', authenticateToken, checkLogin, (req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        // Truyền userId vào view bằng cách lấy trực tiếp từ session.cart
        const userId = req.session.cart && req.session.cart[0] && req.session.cart[0].userId;
        const username = req.session.cart && req.session.cart[0] && req.session.cart[0].username;
        const email = req.session.cart && req.session.cart[0] && req.session.cart[0].email;
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
            userId: userId,
            username: username,
            email: email,
            isLoggedIn: req.isLoggedIn,
            layout: 'main'
        });
        //console.log(req.session.cart[0]); // Kiểm tra phần tử đầu tiên của session cart
    }
});


/*
 * POST update product
 */
router.post('/update/:product', checkLogin, (req, res) => {
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            //console.log(req.session.cart);
            //console.log('session updated2: ', req.session);
            break;
        }
    }

    res.json({ cart }); // Phản hồi với dữ liệu giỏ hàng dưới dạng JSON
    
});

/*
 * GET clear cart
 */
router.get('/clear', checkLogin, (req, res) => {

    delete req.session.cart;
    //console.log('session after deleting: ', req.session);
    
    //res.redirect('/cart/checkout');
    res.send(`
        <script>
            window.location.href = '/cart/checkout';
        </script>
    `);

});

/*
 * GET buy now
 */
router.get('/buynow', checkLogin, (req, res) => {

    delete req.session.cart;
    
    res.sendStatus(200);

});
    

/*
 * POST lưu đơn hàng vào cơ sở dữ liệu
 */

router.post('/checkout2', checkLogin, async (req, res) => {
    try {
        // Lấy thông tin đơn hàng từ session
        const { cart } = req.session;

        // Lấy userId từ session.cart
        const userId = cart && cart[0] && cart[0].userId;
        const username = cart && cart[0] && cart[0].username;
        const email = cart && cart[0] && cart[0].email;


        // Tạo một đối tượng Order mới từ thông tin đơn hàng và userId
        const newOrder = new Order({
            products: cart,
            total: calculateTotal(cart),
            user: { 
                userId: userId, // Lưu userId vào thông tin đơn hàng
                username: username, // Lưu username vào thông tin đơn hàng
                email: email // Lưu email vào thông tin đơn hàng
            }
        });

        // Lưu đơn hàng vào cơ sở dữ liệu
        const savedOrder = await newOrder.save();

        // Xóa giỏ hàng khỏi session sau khi đơn hàng đã được lưu
        delete req.session.cart;

        // Phản hồi với thông tin đơn hàng đã được lưu
        res.json(savedOrder);
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Hàm tính tổng giá trị của đơn hàng
function calculateTotal(cart) {
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.price) * item.qty;
    });
    return total.toFixed(2);
}


// Đường dẫn đến trang order_success
router.get('/order_success', authenticateToken, checkLogin, (req, res) => {
    res.render('order_success', { title: 'Order Success', isLoggedIn: req.isLoggedIn });
});




// Exports
module.exports = router;
