
var Product = require('../models/product');
var Order = require('../models/cart');



// Hàm tính tổng giá trị của đơn hàng
function calculateTotal(cart) {
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.price) * item.qty;
    });
    return total.toFixed(2);
}

class CartController {

    async getaddproducttocart(req, res) { 
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
                //console.log('first session: ', req.session);
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
                    window.location.href = '/product';
                </script>
            `);
            //res.redirect('back');
        } catch (err) {
            console.log(err);
            res.status(500).send("Server Error");
        }
    }

    getcartpage(req, res) { 
        if (req.session.cart && req.session.cart.length == 0) {
            delete req.session.cart;
            res.redirect('/checkout');
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
    }

    postupdatecart(req, res) { 
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
    }

    getclearcart(req, res) { 
        delete req.session.cart;
        //console.log('session after deleting: ', req.session);
        
        //res.redirect('/cart/checkout');
        res.send(`
            <script>
                window.location.href = '/checkout';
            </script>
        `);
    }

    getbuynow(req, res) { 
        delete req.session.cart;
    
        res.sendStatus(200);
    }

    async postodertodb(req, res) {
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
    }

    getordersuccess(req, res) { 
        res.render('order_success', { title: 'Order Success', isLoggedIn: req.isLoggedIn });
    }


}

module.exports = new CartController(); 
