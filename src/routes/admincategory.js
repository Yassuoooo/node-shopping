const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { mongooseToObject } = require('../util/mongoose');
const jwt = require('jsonwebtoken');


// Import middleware checkLogin
const checkLogin = require('../middleware/checklogin');
// const checkAdminCategory = require('../middleware/checkrole');
const checkAdmin = require('../middleware/checkrole');


var Category = require('../app/models/category');


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
 * GET category index
 */

// router.get('/', authenticateToken, checkLogin, checkAdmin, async (req, res) => {
//     try {
//         // Kiểm tra nếu yêu cầu đến từ Postman
//         if (req.headers['user-agent'] && req.headers['user-agent'].includes('Postman')) {
//             // Nếu từ Postman, trả về JSON category từ cơ sở dữ liệu
//             const categories = await Category.find();
//             return res.status(200).json(categories);
//         } else {
//             // Nếu không phải từ Postman, trả về trang danh sách category
//             const categories = await Category.find();
//             const categoriesObject = categories.map(category => mongooseToObject(category));
            
//             // Render the handlebars template with the converted categories
//             res.render('admin/categories2', {
//                 categories: categoriesObject,
//                 isLoggedIn: req.isLoggedIn,
//                 layout: 'adminmain'
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         // Trả về lỗi nếu có lỗi xảy ra
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// });



// postman::
router.get('/p-category', (req, res) => {
    Category.find({}).exec()
        .then(categories => {
            res.status(200).json(categories);
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// client:
router.get('/', authenticateToken, checkLogin, checkAdmin, (req, res) => { 
    // Find all categories
    Category.find()
        .then(categories => {
            // If categories are found, convert them to regular JavaScript objects
            const categoriesObject = categories.map(category => mongooseToObject(category));
            
            // Render the handlebars template with the converted categories
            res.render('admin/categories2', {
                categories: categoriesObject,
                isLoggedIn: req.isLoggedIn,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// category id Postman
router.get('/p-categoryid/:categoryId', async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/*
 * GET add category
 */
router.get('/add-category', authenticateToken, checkLogin, checkAdmin, (req, res, next) => {

    var title = "";

    res.render('admin/add_category2', {
        title: title,
        isLoggedIn: req.isLoggedIn,
        layout: 'adminmain'
    });

});

/*
 * POST add category
 */

// postman:
router.post('/p-addcategory', [
    body('title').notEmpty().withMessage('Title must have a value.'),
], (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('admin/add_category', {
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
                        return res.status(201).json('created');
                    });
            }
        })
        .catch(err => {
            return res.status(500).json('Failed Creating category: ' + err);
        });
});


// client:
router.post('/add-category', [
    body('title').notEmpty().withMessage('Title must have a value.'),
], checkLogin, checkAdmin, (req, res) => {

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
                        return res.status(201).redirect('/admincategory');
                    });
            }
        })
        .catch(err => {
            return res.status(500).json('Failed Creating category: ' + err);
        });
});

/*
 * GET edit category
 */
router.get('/edit-category/:id', authenticateToken, checkLogin, checkAdmin, (req, res) => {

    Category.findById(req.params.id)
        .then(category => {
            if (!category) {
                return res.status(404).send('Category not found');
            }
            res.render('admin/edit_category2', {
                title: category.title,
                id: category._id,
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
 * PUT edit category
 */

// postman:
router.put('/p-editcategory/:id', [
    body('title').notEmpty().withMessage('Title must have a value.')
], (req, res) => {

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
            //res.redirect('/admincategory');
            res.status(200).json('updated');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

});

// client:
router.put('/edit-category/:id', [
    body('title').notEmpty().withMessage('Title must have a value.')
], checkLogin, checkAdmin, (req, res) => {

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
            res.redirect('/admincategory');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

});

/*
 * DELETE remove category
 */

// postman:
router.delete('/p-deletecategory/:id', (req, res) => {
    Category.findOneAndDelete({ _id: req.params.id })
        .then(deletedCategory => {
            if (!deletedCategory) {
                return res.status(404).send('Category not found');
            }
            return Category.find({}).exec();
        })
        .then(categories => {
            req.app.locals.categories = categories;
            res.status(200).json('deleted');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// client:
router.delete('/delete-category/:id', checkLogin, checkAdmin, (req, res) => {
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
            res.redirect('/admincategory');
            //res.json('deleted');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});


module.exports = router;

