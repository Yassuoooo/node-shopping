
const express = require('express');
const router = express.Router(); 

// Get Product model
var Product = require('../app/models/product');




/*
 * POST add product to cart
 */
router.post('/add/:product', (req, res) => {
    const slug = req.params.product;

    // Lấy thông tin sản phẩm từ cơ sở dữ liệu
    Product.findOne({ slug: slug })
        .then(p => {
            // Kiểm tra nếu sản phẩm không tồn tại
            if (!p) {
                console.log("Product not found");
                res.status(404).send("Product not found");
                return;
            }

            // Kiểm tra nếu giỏ hàng chưa được khởi tạo, khởi tạo nó nếu cần
            if (typeof req.session.cart === "undefined") {
                req.session.cart = [];
            }

            // Thêm sản phẩm vào giỏ hàng trong session
            req.session.cart.push({
                title: p.title,
                qty: 1,
                price: parseFloat(p.price).toFixed(2),
                image: `/product_images/${p._id}/${p.image}`
            });
            //console.log(req.session.cart);

            req.flash('success', 'Product added!');
            res.status(200).send("Product added!");
            //res.redirect('back');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal server error");
        });
});

/*
 * GET checkout page
 */
// router.get('/checkout', (req, res) => {
//     var totalValue = 0;
//     if (req.session.cart && req.session.cart.length > 0) {
//         totalValue = req.session.cart.reduce((acc, item) => acc + parseFloat(item.price) * item.qty, 0);
//     }

//     res.render('checkout', {
//         title: 'Checkout',
//         cart: req.session.cart,
//         totalValue: totalValue.toFixed(2) // Format lại giá trị total
//     });
// });


// Route để hiển thị trang thanh toán
router.get('/checkout', (req, res) => {
    // Lấy giỏ hàng từ session
    const cart = req.session.cart || [];
    let totalValue = 0;
    //console.log(cart);

    // Tính tổng giá trị của giỏ hàng
    if (cart.length > 0) {
        totalValue = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.qty, 0);
    }

    // Trả về trang thanh toán với dữ liệu giỏ hàng và tổng giá trị
    res.render('checkout', {
        title: 'Checkout',
        cart: cart,
        totalValue: totalValue.toFixed(2)
    });

});

/*
 * PUT update product
 */

router.put('/update/:product', (req, res) => {
    const slug = req.params.product;
    const cart = req.session.cart || [];
    const action = req.query.action;

    // Tìm chỉ số của sản phẩm trong giỏ hàng
    const productIndex = cart.findIndex(item => item.title === slug);

    if (productIndex !== -1) {
        // Nếu sản phẩm đã tồn tại trong giỏ hàng
        switch (action) {
            case "add":
                cart[productIndex].qty++;
                break;
            case "remove":
                cart[productIndex].qty--;
                if (cart[productIndex].qty < 1)
                    cart.splice(productIndex, 1);
                break;
            case "clear":
                cart.splice(productIndex, 1);
                break;
            default:
                console.log('Invalid action');
                res.status(400).send('Invalid action');
                return;
        }
    } else {
        // Nếu sản phẩm không tồn tại trong giỏ hàng
        switch (action) {
            case "add":
                cart.push({
                    title: slug,
                    qty: 1,
                    // Thêm các thông tin khác về sản phẩm nếu cần
                });
                break;
            default:
                console.log('Product not found in cart');
                res.status(404).send('Product not found in cart');
                return;
        }
    }

    // Cập nhật giỏ hàng trong session
    req.session.cart = cart;
    console.log(cart);
    req.flash('success', 'Cart updated!');
    res.status(200).send('Cart updated!');
});



// Exports
module.exports = router;


