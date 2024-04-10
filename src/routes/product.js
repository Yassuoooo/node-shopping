
const express = require('express');
const router = express.Router(); 
const fs = require('fs');
const path = require('path');
const { mongooseToObject } = require('../util/mongoose');

var Product = require('../app/models/product');
var Category = require('../app/models/category');


/*
 * GET all products
 */
router.get('/', (req, res) => {
    Product.find()
        .then(products => {
            // Chuyển đổi dữ liệu từ MongoDB sang đối tượng JavaScript
            const productsObject = products.map(product => mongooseToObject(product));
            
            res.render('all_products', {
                title: 'All products',
                products: productsObject, // Sử dụng dữ liệu đã chuyển đổi
                layout: 'main'
            });
            //console.log(productsObject);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        });
});

/*
 * GET products by category
 */
router.get('/filter', (req, res) => {
    const categoryId = req.query.category;

    Category.findOne({ slug: categoryId })
        .then(category => {
            if (!category) {
                console.log("Danh mục không tồn tại.");
                res.status(404).send("Danh mục không tồn tại.");
            } else {
                Product.find({ category: categoryId })
                    .then(products => {
                        // Convert mongoose objects to regular JavaScript objects
                        const productsObject = products.map(product => mongooseToObject(product));
                        
                        res.render('product_cate', {
                            title: category.title,
                            products: productsObject, // Use the converted products array
                            layout: 'main'
                        });
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
router.get('/:category/:product', (req, res) => {

    Product.findOne({ slug: req.params.product })
        .then(product => {
            if (!product) {
                console.log("Sản phẩm không tồn tại.");
                res.status(404).send("Sản phẩm không tồn tại.");
            } else {
                var galleryDir = path.join(__dirname, '../public/product_images/', product._id.toString());

                fs.readdir(galleryDir, (err, files) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send("Lỗi máy chủ nội bộ.");
                    } else {
                        const galleryImages = files;

                        // Chuyển đổi product thành object JavaScript
                        const productObject = mongooseToObject(product);

                        res.render('product', {
                            title: productObject.title,
                            p: productObject,
                            galleryImages: galleryImages,
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

