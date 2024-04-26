
const { mongooseToObject } = require('../../util/mongoose');

var Product = require('../models/product');
var Category = require('../models/category');
var Page = require('../models/page');


class HomeController {


    // Home:
    async gethome(req, res) {
            try {

            // Lấy danh sách sản phẩm
            const products = await Product.find();

            // Lấy danh sách các danh mục
            const categories = await Category.find();

            // Chuyển đổi danh sách sản phẩm từ MongoDB sang JavaScript object
            const productsObject = products.map(product => mongooseToObject(product));

            // Chuyển danh sách các danh mục sang JavaScript object (nếu cần thiết)
            const categoriesObject = categories.map(category => mongooseToObject(category));
            
            // Lấy nội dung của trang chủ từ cơ sở dữ liệu
            const page = await Page.findOne({ slug: 'home' });

            if (!page) {
                // Trang không tồn tại
                return res.status(404).send("Trang không tồn tại.");
            }

            // Render trang home và truyền danh sách sản phẩm và nội dung của trang vào template
            res.render('home', {
                title: page.title,
                content: page.content,
                products: productsObject, // Truyền danh sách sản phẩm vào template
                categories: categoriesObject,
                isLoggedIn: req.isLoggedIn, 
                layout: 'main'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        }
    }

    getproductbycategory(req, res) {
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
                        res.render('home', {
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
    }

    async getcontact(req, res) { 
        try {     
            // Lấy nội dung của trang chủ từ cơ sở dữ liệu
            const page = await Page.findOne({ slug: 'contact-us' });
    
            if (!page) {
                // Trang không tồn tại
                return res.status(404).send("Trang không tồn tại.");
            }
    
            // Render trang home và truyền danh sách sản phẩm và nội dung của trang vào template
            res.render('contact-us', {
                title: page.title,
                content: page.content,
                isLoggedIn: req.isLoggedIn, 
                layout: 'main'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        }
    }

    async getblog(req, res) { 
        try {     
            // Lấy nội dung của trang chủ từ cơ sở dữ liệu
            const page = await Page.findOne({ slug: 'blog-slug' });
    
            if (!page) {
                // Trang không tồn tại
                return res.status(404).send("Trang không tồn tại.");
            }
    
            // Render trang home và truyền danh sách sản phẩm và nội dung của trang vào template
            res.render('blog', {
                title: page.title,
                content: page.content,
                isLoggedIn: req.isLoggedIn, 
                layout: 'main'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        }
    }

    async getservice(req, res) { 
        try {     
            // Lấy nội dung của trang chủ từ cơ sở dữ liệu
            const page = await Page.findOne({ slug: 'services-slug' });
    
            if (!page) {
                // Trang không tồn tại
                return res.status(404).send("Trang không tồn tại.");
            }
    
            // Render trang home và truyền danh sách sản phẩm và nội dung của trang vào template
            res.render('services', {
                title: page.title,
                content: page.content,
                isLoggedIn: req.isLoggedIn, 
                layout: 'main'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        }
    }

    async getabout(req, res) { 
        try {     
            // Lấy nội dung của trang chủ từ cơ sở dữ liệu
            const page = await Page.findOne({ slug: 'about-us' });
    
            if (!page) {
                // Trang không tồn tại
                return res.status(404).send("Trang không tồn tại.");
            }
    
            // Render trang home và truyền danh sách sản phẩm và nội dung của trang vào template
            res.render('about-us', {
                title: page.title,
                content: page.content,
                isLoggedIn: req.isLoggedIn, 
                layout: 'main'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        }
    }

    getlogout(req, res) { 
        // Xóa cookie token
        res.clearCookie('token');
        // Chuyển hướng người dùng đến trang đăng nhập
        res.redirect('/account/login');
    }


}

module.exports = new HomeController(); 
