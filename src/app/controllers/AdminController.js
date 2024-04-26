
// const { mongooseToObject } = require('../../util/mongoose');
const { mongooseToObject } = require('../../util/mongooseToObject');
const { body, validationResult } = require('express-validator');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

var Category = require('../models/category');
var Page = require('../models/page');
var Product = require('../models/product');
var AccountModel = require('../models/account');
var Order = require('../models/cart');



class AdminController {

    
    // Home:
    gethome(req, res) {
        res.render('admin/adminhome2', {
            isLoggedIn: req.isLoggedIn,
            layout: 'adminmain'
        });
    }


    // Category:
    getcategory(req, res) {
        // Find all categories
        Category.find()
        .then(categories => {
            // If categories are found, convert them to regular JavaScript objects
            const categoriesObject = categories.map(category => mongooseToObject(category));
            
            // Render the handlebars template with the converted categories
            res.render('admin/categories2', {
                categories: categoriesObject,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

    getaddcategory(req, res) { 
        var title = "";

        res.render('admin/add_category2', {
            title: title,
            layout: 'adminmain'
        });
    }

    postaddcategory(req, res) { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('admin/add_category2', {
                errors: errors.array(),
                title: req.body.title,         
                layout: 'adminmain'
            });
        }

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-').toLowerCase();

        Category.findOne({ title: title })
            .then(data => {
                if (data) {
                    return res.status(400).json('Category already exists');
                } else {
                    return Category.create({
                        title: title,
                        slug: slug,
                    })
                        .then(() => {
                            return res.status(201).redirect('/admin/categories');
                        });
                }
            })
            .catch(err => {
                return res.status(500).json('Failed Creating category: ' + err);
            });
    }

    geteditcategory(req, res) { 
        Category.findById(req.params.id)
        .then(category => {
            if (!category) {
                return res.status(404).send('Category not found');
            }
            res.render('admin/edit_category2', {
                title: category.title,
                id: category._id,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

    puteditcategory(req, res) { 
        const id = req.params.id;
        const title = req.body.title;
        const slug = title.replace(/\s+/g, '-').toLowerCase();
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render('admin/edit_category2', {
                errors: errors.array(),
                title: req.body.title,
                slug: title.replace(/\s+/g, '-').toLowerCase(),
                layout: 'adminmain'
            });
        } else {
            Category.findById(id)
            .then(category => {
                if (!category) {
                    return res.status(404).send('Category not found');
                } else {
                    category.title = title;
                    category.slug = slug;
                    return category.save();
                }
            })
            .then(() => {
                req.flash('success', 'Category edited!');
                res.redirect('/admin/categories');
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
        }
    }

    deletecategory(req, res) { 
        Category.findOneAndDelete({ _id: req.params.id })
        .then(deletedCategory => {
            if (!deletedCategory) {
                return res.status(404).send('Category not found');
            }
            return Category.find({}).exec();
        })
        .then(categories => {
            req.app.locals.categories = categories;
            req.flash('success', 'Category deleted!');
            res.redirect('/admin/categories');
            //res.json('deleted');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }
    
    
    // Page:
    getpage(req, res) {
        // Find all pages and sort them by sorting field
        Page.find({}).sort({ sorting: 1 }).exec()
        .then(pages => {
            // If pages are found, convert them to regular JavaScript objects
            const pagesObject = pages.map(page => mongooseToObject(page));
            
            // Render the handlebars template with the converted pages
            res.render('admin/pages2', {
                pages: pagesObject,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    }

    getaddpage(req, res) { 
        var title = "";
        var slug = "";
        var content = "";

        res.render('admin/add_page2', {
            title: title,
            slug: slug,
            content: content,
            layout: 'adminmain'
        });
    }

    postaddpage(req, res) { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('admin/add_page', {
                errors: errors.array(),
                title: req.body.title,
                slug: req.body.slug.replace(/\s+/g, '-').toLowerCase() || req.body.title.replace(/\s+/g, '-').toLowerCase(),
                content: req.body.content,
                layout: 'adminmain'
            });
        }

        var title = req.body.title;
        var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase() || req.body.title.replace(/\s+/g, '-').toLowerCase();
        var content = req.body.content;

        Page.findOne({ title: title })
            .then(data => {
                if (data) {
                    return res.status(400).json('Page already exists');
                } else {
                    return Page.create({
                        title: title,
                        slug: slug,
                        content: content,
                        sorting: 100
                    })
                        .then(() => {
                            return res.status(201).redirect('/admin/pages');
                        });
                }
            })
            .catch(err => {
                return res.status(500).json('Failed Creating page: ' + err);
            });
    }

    geteditpage(req, res) { 
        Page.findById(req.params.id)
        .then(page => {
            if (!page) {
                // Trả về lỗi 404 nếu không tìm thấy page
                return res.status(404).send('Page not found');
            }
            res.render('admin/edit_page2', {
                title: page.title,
                slug: page.slug,
                content: page.content,
                id: page._id,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            // Xử lý lỗi nếu có
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

    puteditpage(req, res) { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('admin/edit_page', {
                errors: errors.array(),
                title: req.body.title,
                slug: req.body.slug.replace(/\s+/g, '-').toLowerCase() || req.body.title.replace(/\s+/g, '-').toLowerCase(),
                content: req.body.content,
                layout: 'adminmain'
            });
        }

        const id = req.params.id;
        const title = req.body.title;
        let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase() || req.body.title.replace(/\s+/g, '-').toLowerCase();
        const content = req.body.content;

        Page.findById(id)
            .then(page => {
                if (!page) {
                    return res.status(404).send('Page not found');
                } else {
                    page.title = title;
                    page.slug = slug;
                    page.content = content;
                    return page.save();
                }
            })
            .then(() => {
                req.flash('success', 'Page edited!');
                res.status(200).redirect('/admin/pages');
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    }

    deletepage(req, res) { 
        Page.findOneAndDelete({ _id: req.params.id })
        .then(deletedPage => {
            if (!deletedPage) {
                return res.status(404).send('Page not found');
            }
            return Page.find({}).sort({ sorting: 1 }).exec();
        })
        .then(pages => {
            req.app.locals.pages = pages;
            req.flash('success', 'Page deleted!');
            res.status(200).redirect('/admin/pages');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }


    // Product:
    getproduct(req, res) {
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
                    layout: 'adminmain'
                });
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    }

    getaddproduct(req, res) { 
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
                    layout: 'adminmain'
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    }

    postaddproduct(req, res) { 
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
                const productDir = path.join(__dirname, '../../public/product_images', newProduct._id.toString());
                //console.log(productDir);

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
                            return res.status(201).redirect('/admin/products');
                        });
                    } else {
                        //return res.status(201).json({ message: 'Product added!', product: newProduct });
                        return res.status(201).redirect('/admin/products');
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
    }

    geteditproduct(req, res) { 
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
    }

    puteditproduct(req, res) { 
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
                res.redirect('/admin/products');
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }

    deleteproduct(req, res) { 
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
                res.status(200).redirect('/admin/products');
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    }


    // Users:
    getuser(req, res) { 
        let count;

        AccountModel.countDocuments()
            .then((c) => {
                count = c;
                return AccountModel.find().exec();
            })
            .then((users) => {
                const usersArray = users.map(user => mongooseToObject(user));
                res.render('admin/users', {
                    users: usersArray,
                    count: count,
                    layout: 'adminmain'
                });
                //console.log(usersArray);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    }

    getedituser(req, res) {
        AccountModel.findById(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).send('User not found');
            }
            res.render('admin/edit_user', {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

    putedituser(req, res) {
        const id = req.params.id;
        const username = req.body.username;
        const email = req.body.email;
        const role = req.body.role;
        const errors = validationResult(req);
        //console.log(id);
        if (!errors.isEmpty()) {
            return res.render('admin/edit_user', {
                errors: errors.array(),
                username: req.body.username,
                email: req.body.email,
                role: req.body.role,
                layout: 'adminmain'
            });
        } else {
            AccountModel.findById(id)
            .then(user => {
                if (!user) {
                    return res.status(404).send('User not found');
                } else {
                    user.username = username;
                    user.email = email;
                    user.role = role;
                    return user.save();
                    
                }
            })
            .then(() => {
                //req.flash('success', 'Category edited!');
                res.redirect('/admin/users');
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
        }
    }

    deleteuser(req, res) { 
        AccountModel.findOneAndDelete({ _id: req.params.id })
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).send('User not found');
            }
            return AccountModel.find({}).exec();
        })
        .then(users => {
            req.app.locals.users = users;
            res.redirect('/admin/users');
            //res.json('deleted');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }


    // Orders:
    async getorder (req, res) { 
        try {
            const orders = await Order.find().populate('user.userId');
            const ordersObject = orders.map(order => ({
                _id: order._id,
                username: order.user[0].username,
                total: order.total
            }));
            res.render('admin/orders2', { title: 'Admin Orders', orders: ordersObject, layout: 'adminmain' });
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getorderdetails(req, res) { 
        try {
            const orderId = req.params.orderId;
            const order = await Order.findById(orderId).populate('user.userId');
            const orderObject = mongooseToObject(order);
            res.render('admin/orderdetails2', { title: 'Order Detail', order: orderObject, layout: 'adminmain' });
        } catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

}

module.exports = new AdminController(); 
