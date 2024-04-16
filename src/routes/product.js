
const express = require('express');
const router = express.Router(); 
const fs = require('fs');
const path = require('path');
const { mongooseToObject } = require('../util/mongoose');
const jwt = require('jsonwebtoken');

var Product = require('../app/models/product');
var Category = require('../app/models/category');

/*
 * GET all products
 */
// router.get('/', (req, res) => {
//     Product.find()
//         .then(products => {
//             // Chuyển đổi dữ liệu từ MongoDB sang đối tượng JavaScript
//             const productsObject = products.map(product => mongooseToObject(product));
            
//             res.render('product', {
//                 title: 'All products',
//                 products: productsObject, // Sử dụng dữ liệu đã chuyển đổi
//                 layout: 'main'
//             });
//             //console.log(productsObject);
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).send("Lỗi máy chủ nội bộ.");
//         });
// });

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

router.get('/', authenticateToken, (req, res) => {
    // Lấy tất cả sản phẩm
    Product.find()
        .then(products => {
            // Chuyển đổi dữ liệu sản phẩm từ MongoDB sang đối tượng JavaScript
            const productsObject = products.map(product => mongooseToObject(product));

            // Lấy tất cả danh mục
            Category.find()
                .then(categories => {
                    // Chuyển đổi dữ liệu danh mục từ MongoDB sang đối tượng JavaScript
                    const categoriesObject = categories.map(category => mongooseToObject(category));

                    res.render('product', {
                        title: 'All products',
                        products: productsObject, // Sử dụng dữ liệu sản phẩm đã chuyển đổi
                        categories: categoriesObject, // Sử dụng dữ liệu danh mục đã chuyển đổi
                        isLoggedIn: req.isLoggedIn,
                        layout: 'main'
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send("Lỗi máy chủ nội bộ.");
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        });
});


/*
 * GET products by category
 */

router.get('/category/:slug', authenticateToken, (req, res) => {
    const categorySlug = req.params.slug;
    //console.log(categorySlug);
    // Tìm danh mục theo slug
    Category.findOne({ slug: categorySlug })
        .then(category => {
            if (!category) {
                return res.status(404).send('Category not found');
            }

            // Tìm sản phẩm theo category tương ứng
            Product.find({ category: category.slug }) // Sử dụng slug của danh mục
                .then(products => {
                    // Chuyển đổi dữ liệu sản phẩm từ MongoDB sang đối tượng JavaScript
                    const productsObject = products.map(product => mongooseToObject(product));
                    //console.log(productsObject);
                    res.render('product', {
                        title: category.title,
                        products: productsObject,
                        isLoggedIn: req.isLoggedIn,
                        layout: 'main'
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send("Internal Server Error");
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});


/*
 * GET product details
 */
router.get('/:product', authenticateToken, (req, res) => {

    Product.findOne({ slug: req.params.product })
        .then(product => {
            if (!product) {
                console.log("Sản phẩm không tồn tại.");
                res.status(404).send("Sản phẩm không tồn tại.");
            } else {
                var galleryDir = path.join(__dirname, '../public/product_images/', product._id.toString());
                //console.log(galleryDir);
                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Lỗi máy chủ nội bộ.");
                    } else {
                        const galleryImages = files;
                        //console.log(galleryImages);
                        // Chuyển đổi product thành object JavaScript
                        const productObject = mongooseToObject(product);
                        //console.log(productObject);
                        res.render('product_details', {
                            title: productObject.title,
                            p: productObject,
                            galleryImages: galleryImages,
                            isLoggedIn: req.isLoggedIn,
                            layout: 'main'
                        });
                    }
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        });

});


module.exports = router;

