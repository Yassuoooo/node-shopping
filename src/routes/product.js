
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
// router.get('/filter', (req, res) => {
//     const categoryId = req.query.category;

//     Category.findOne({ slug: categoryId })
//         .then(category => {
//             if (!category) {
//                 console.log("Danh mục không tồn tại.");
//                 res.status(404).send("Danh mục không tồn tại.");
//             } else {
//                 Product.find({ category: categoryId })
//                     .then(products => {
//                         // Convert mongoose objects to regular JavaScript objects
//                         const productsObject = products.map(product => mongooseToObject(product));
                        
//                         res.render('product_cate', {
//                             title: category.title,
//                             products: productsObject, // Use the converted products array
//                             layout: 'main'
//                         });
//                     })
//                     .catch(err => {
//                         console.error(err);
//                         res.status(500).send("Lỗi máy chủ nội bộ.");
//                     });
//             }
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).send("Lỗi máy chủ nội bộ.");
//         });
// });

router.get('/filter', (req, res) => {
    const categorySlug = req.query.category; // Sử dụng req.query thay vì req.params
    console.log(categorySlug);
    // Tìm danh mục có slug tương ứng
    Category.findOne({ slug: categorySlug })
        .then(category => {
            if (!category) {
                // Nếu không tìm thấy danh mục, trả về lỗi 404
                console.log("Danh mục không tồn tại.");
                return res.status(404).send("Danh mục không tồn tại.");
            } else {
                // Tìm các sản phẩm có category tương ứng với slug của danh mục
                Product.find({ category: categorySlug })
                    .then(products => {
                        // Lấy danh sách các title của sản phẩm
                        const productTitles = products.map(product => product.title);
                        console.log(productTitles);
                        // Trả về danh sách các title sản phẩm đã lọc
                        res.send(productTitles);
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).send("Lỗi máy chủ nội bộ.");
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        });
});


/*
 * GET product details
 */
router.get('/:category/:product', authenticateToken, (req, res) => {

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

