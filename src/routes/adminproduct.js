const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
//const { mongooseToObject } = require('../util/mongoose');
const mkdirp = require('mkdirp');
const { mongooseToObject } = require('../util/mongooseToObject');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');


const checkLogin = require('../middleware/checklogin');
const checkAdminProduct = require('../middleware/checkrole');

var Product = require('../app/models/product');
var Category = require('../app/models/category');

//const productDir = path.join(__dirname, '../product_images', newProduct._id.toString());


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
 * GET products index
 */

// postman:
router.get('/p-product', (req, res) => {
    Product.find({}).exec()
        .then(products => {
            res.status(200).json(products);
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// client:
router.get('/', authenticateToken, checkLogin, checkAdminProduct, (req, res) => {
    let count;

    Product.countDocuments()
        .then((c) => {
            count = c;
            return Product.find().exec();
        })
        .then((products) => {
            const productsArray = products.map(product => mongooseToObject(product));
            res.render('admin/products2', {
                products: productsArray,
                count: count,
                isLoggedIn: req.isLoggedIn,
                layout: 'adminmain'
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

/*
 * GET add product
 */
router.get('/add-product', authenticateToken, checkLogin, checkAdminProduct, (req, res) => {
    const title = "";
    const desc = "";
    const price = "";

    Category.find()
        .then(categories => {
            const categoriesObject = categories.map(category => mongooseToObject(category));
            res.render('admin/add_product2', {
                title: title,
                desc: desc,
                categories: categoriesObject,
                price: price,
                isLoggedIn: req.isLoggedIn,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

/*
 * POST add product
 */

// postman:
router.post('/p-addproduct', [
    body('title').notEmpty().withMessage('Title must have a value.'),
    body('desc').notEmpty().withMessage('Description must have a value.'),
    body('price').isDecimal().withMessage('Price must have a value.')
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, desc, price, category, image } = req.body;

    // Kiểm tra xem sản phẩm đã tồn tại chưa
    Product.findOne({ title: title })
        .then(existingProduct => {
            if (existingProduct) {
                return res.status(400).json({ error: 'Product title exists, choose another.' });
            } else {
                // Tạo mới sản phẩm
                const product = new Product({
                    title: title,
                    slug: title.replace(/\s+/g, '-').toLowerCase(),
                    desc: desc,
                    price: price,
                    category: category,
                    image: image // Lưu tên của hình ảnh được nhập từ postman
                });

                return product.save();
            }
        })
        .then(newProduct => {
            return res.status(201).json('created');
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// client:
router.post('/add-product', [
    body('title').notEmpty().withMessage('Title must have a value.'),
    body('desc').notEmpty().withMessage('Description must have a value.'),
    body('price').isDecimal().withMessage('Price must have a value.'),
    body('image').custom((value, { req }) => {
        if (!req.files || !req.files.image) {
            throw new Error('You must upload an image');
        }
        return true;
    })
], checkLogin, checkAdminProduct, (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Handle validation errors
        return res.status(400).json({ errors: errors.array() });
    }

    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = parseFloat(req.body.price).toFixed(2);
    const category = req.body.category;
    const imageFile = req.files.image.name;

    // Kiểm tra xem sản phẩm đã tồn tại chưa
    Product.findOne({ slug: slug })
        .then(existingProduct => {
            if (existingProduct) {
                return res.status(400).json({ error: 'Product title exists, choose another.' });
            } else {
                // Tạo mới sản phẩm
                const product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price,
                    category: category,
                    image: imageFile
                });

                return product.save();
            }
        })
        .then(newProduct => {
            // Tạo thư mục cho hình ảnh sản phẩm
            //const productDir = path.join(__dirname, 'product_images', newProduct._id.toString());
            //const productDir = 'public/product_images/' + newProduct._id.toString();
            const productDir = path.join(__dirname, '../public/product_images', newProduct._id.toString());

            try {
                fs.mkdirSync(productDir, { recursive: true });
                fs.mkdirSync(productDir + '/gallery', { recursive: true });
                fs.mkdirSync(productDir + '/gallery/thumbs', { recursive: true });

                // Di chuyển hình ảnh sản phẩm vào thư mục
                if (imageFile !== "") {
                    const productImage = req.files.image;
                    const path = productDir + '/' + imageFile;

                    productImage.mv(path, function (err) {
                        if (err)
                            return res.status(500).json({ error: 'Internal Server Error' });

                        //return res.status(201).json({ message: 'Product added!', product: newProduct });
                        return res.status(201).redirect('/adminproduct');
                    });
                } else {
                    //return res.status(201).json({ message: 'Product added!', product: newProduct });
                    return res.status(201).redirect('/adminproduct');
                }
            } catch (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


/*
 * GET edit product
 */

router.get('/edit-product/:id', authenticateToken, checkLogin, checkAdminProduct, (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            if (!product) {
                // Trả về lỗi 404 nếu không tìm thấy sản phẩm
                return res.status(404).send('Product not found');
            }
            Category.find()
                .then(categories => {
                    // Chuyển đổi mỗi đối tượng category từ dạng Mongoose Document sang dạng đối tượng JavaScript thông thường
                    // bằng cách sử dụng hàm mongooseToObject
                    const categoriesObject = categories.map(category => mongooseToObject(category));
                    
                    res.render('admin/edit_product2', {
                        title: product.title,
                        errors: null, // Không cần xử lý lỗi ở đây
                        desc: product.desc,
                        categories: categoriesObject,
                        category: product.category.replace(/\s+/g, '-').toLowerCase(),
                        price: parseFloat(product.price).toFixed(2),
                        image: product.image,
                        id: product._id,
                        isLoggedIn: req.isLoggedIn,
                        layout: 'adminmain'
                    });
                })
                .catch(err => {
                    // Xử lý lỗi nếu có
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                });
        })
        .catch(err => {
            // Xử lý lỗi nếu có
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});


/*
 * PUT edit product
 */

// postman:
router.put('/p-editproduct/:id', (req, res) => {
    const id = req.params.id;
    const { title, desc, price, category, pimage } = req.body;
    const slug = title.replace(/\s+/g, '-').toLowerCase();

    Product.findById(id)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            product.title = title;
            product.slug = slug;
            product.desc = desc;
            product.price = parseFloat(price).toFixed(2);
            product.category = category;

            if (req.files && req.files.image) {
                const imageFile = req.files.image.name;
                product.image = imageFile;
            }

            return product.save();
        })
        .then(() => {
            //res.status(200).json({ message: 'Product edited successfully' });
            res.status(200).json('Product edited successfully');
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// client:
router.put('/edit-product/:id', checkLogin, checkAdminProduct, (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.body.pimage;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    Product.findById(id)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            product.title = title;
            product.slug = slug;
            product.desc = desc;
            product.price = parseFloat(price).toFixed(2);
            product.category = category;

            let imageFile = ''; // Khởi tạo biến imageFile
            //console.log(req.files);
            if (req.files && req.files.image) {
                imageFile = req.files.image.name;
                product.image = imageFile;
                //console.log(product.image);
                // Tạo đường dẫn tuyệt đối cho thư mục sản phẩm
                const productDir = path.join(__dirname, '../public/product_images', id.toString());

                // Tạo thư mục nếu chưa tồn tại
                if (!fs.existsSync(productDir)) {
                    fs.mkdirSync(productDir, { recursive: true });
                }

                // Di chuyển hình ảnh mới vào thư mục sản phẩm
                const productImage = req.files.image;
                if (imageFile) {
                    const newPath = path.join(productDir, imageFile);
                    productImage.mv(newPath, err => {
                        if (err) {
                            console.error('Error moving file:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }
                    });
                }

                // Xóa hình ảnh cũ nếu tồn tại
                if (pimage) {
                    const oldPath = path.join(productDir, pimage);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    } else {
                        console.error('File does not exist:', oldPath);
                    }
                }
            }

            return product.save();
        })
        .then(() => {
            req.flash('success', 'Product edited!');
            //res.status(200).json({ message: 'Product edited successfully' });
            res.redirect('/adminproduct');
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


/*
 * DELETE remove product
 */

// postman:
router.delete('/p-deleteproduct/:id', (req, res) => {
    const id = req.params.id;

    Product.findByIdAndDelete(id)
        .then(deletedProduct => {
            if (!deletedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            //res.status(200).json({ message: 'Product deleted successfully' });
            res.status(200).json('Product deleted successfully');
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// client:
router.delete('/delete-product/:id', checkLogin, checkAdminProduct, (req, res) => {
    const id = req.params.id;

    Product.findById(id)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            const productDir = path.join(__dirname, '../public/product_images', id.toString());

            // Kiểm tra xem thư mục sản phẩm có tồn tại không
            if (fs.existsSync(productDir)) {
                // Xóa thư mục sản phẩm và các hình ảnh trong đó
                fs.rmSync(productDir, { recursive: true });
            }

            // Xóa sản phẩm từ cơ sở dữ liệu
            return Product.findByIdAndDelete(id);
        })
        .then(() => {
            req.flash('success', 'Product deleted!');
            res.status(200).redirect('/adminproduct');
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


module.exports = router;
