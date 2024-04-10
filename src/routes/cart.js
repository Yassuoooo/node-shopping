
const express = require('express');
const router = express.Router(); 

// Get Product model
var Product = require('../app/models/product');
var Order = require('../app/models/cart');



/*
 * GET add product to cart
 */
router.get('/add/:product', async (req, res) => {
    try {
        var slug = req.params.product;
        var p = await Product.findOne({ slug: slug });

        if (!p) {
            // Xử lý khi không tìm thấy sản phẩm
            console.log("Product not found");
            return res.status(404).send("Product not found");
        }

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image,
                product_id: p._id // Thêm trường product_id với ObjectId của sản phẩm
            });
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
                    product_id: p._id // Thêm trường product_id với ObjectId của sản phẩm
                });
            }
        }

        req.flash('success', 'Product added!');
        res.redirect('back');
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});


/*
 * GET checkout page
 */
router.get('/checkout', (req, res) => {
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }
});

/*
 * POST update product
 */
router.post('/update/:product', (req, res) => {
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
            break;
        }
    }

    res.json({ cart }); // Phản hồi với dữ liệu giỏ hàng dưới dạng JSON
    
});

/*
 * GET clear cart
 */
router.get('/clear', (req, res) => {

    delete req.session.cart;
    
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');

});

/*
 * GET buy now
 */
router.get('/buynow', (req, res) => {

    delete req.session.cart;
    
    res.sendStatus(200);
    // res.sendStatus(200).render('order_success', {
    //     layout: 'adminmain'
    // });

});
    

/*
 * POST lưu đơn hàng vào cơ sở dữ liệu
 */
router.post('/checkout2', async (req, res) => {
    try {
        // Lấy thông tin đơn hàng từ session
        const { cart } = req.session;

        // Tạo một đối tượng Order mới từ thông tin đơn hàng
        const newOrder = new Order({
            products: cart,
            total: calculateTotal(cart) // Hàm calculateTotal phải được định nghĩa
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
router.get('/order_success', (req, res) => {
    res.render('order_success', { title: 'Order Success' });
});

// Exports
module.exports = router;
