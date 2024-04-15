const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { mongooseToObject } = require('../util/mongoose');
const jwt = require('jsonwebtoken');


// handlebars.registerHelper('eq', function(a, b, options) {
//   return a === b ? options.fn(this) : options.inverse(this);
// });

// Import middleware checkLogin
const checkLogin = require('../middleware/checklogin');
const checkAdminPage = require('../middleware/checkrole');

// Get Page model
var Page = require('../app/models/page');

/*
 * GET pages index
 */

// return data:
// router.get('/get-pages', (req, res) => {
//     // Find all pages and sort them by sorting field
//     Page.find({}).sort({ sorting: 1 }).exec()
//         .then(pages => {
//             // If pages are found, send them as a JSON response
//             res.json(pages);
//         })
//         .catch(err => {
//             // If an error occurs, send a 500 Internal Server Error response
//             console.error(err);
//             res.status(500).json({ error: 'Internal Server Error' });
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

// return rendered page:
router.get('/', authenticateToken, checkLogin, checkAdminPage, (req, res) => {
    // Find all pages and sort them by sorting field
    Page.find({}).sort({ sorting: 1 }).exec()
    .then(pages => {
        // If pages are found, convert them to regular JavaScript objects
        const pagesObject = pages.map(page => mongooseToObject(page));
        
        // Render the handlebars template with the converted pages
        res.render('admin/pages', {
            pages: pagesObject,
            isLoggedIn: req.isLoggedIn,
            layout: 'adminmain'
        });
    })
    .catch(err => {
        // If an error occurs, send a 500 Internal Server Error response
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});


/*
 * GET add page
 */
router.get('/add-page', authenticateToken, checkLogin, checkAdminPage, (req, res, next) => {

    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content,
        isLoggedIn: req.isLoggedIn,
        layout: 'adminmain'
    });

});

/*
 * POST add page
 */

router.post('/add-page', [
    body('title').notEmpty().withMessage('Title must have a value.'),
    body('content').notEmpty().withMessage('Content must have a value.')
], checkLogin, checkAdminPage, (req, res) => {

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
                        return res.status(201).redirect('/adminpage');
                    });
            }
        })
        .catch(err => {
            return res.status(500).json('Failed Creating page: ' + err);
        });
});


/*
 * GET edit page
 */
router.get('/edit-page/:id', authenticateToken, checkLogin, checkAdminPage, (req, res) => {
    Page.findById(req.params.id)
        .then(page => {
            if (!page) {
                // Trả về lỗi 404 nếu không tìm thấy page
                return res.status(404).send('Page not found');
            }
            res.render('admin/edit_page', {
                title: page.title,
                slug: page.slug,
                content: page.content,
                id: page._id,
                isLoggedIn: req.isLoggedIn,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            // Xử lý lỗi nếu có
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});


/*
 * PUT edit page
 */
router.put('/edit-page/:id', [
    body('title').notEmpty().withMessage('Title must have a value.'),
    body('content').notEmpty().withMessage('Content must have a value.')
], checkLogin, checkAdminPage, (req, res) => {

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
            res.redirect('/adminpage');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

/*
 * DELETE remove page
 */
router.delete('/delete-page/:id', checkLogin, checkAdminPage, (req, res) => {
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
            res.redirect('/adminpage');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});



module.exports = router;
