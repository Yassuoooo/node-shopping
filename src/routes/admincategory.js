const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { mongooseToObject } = require('../util/mongoose');

var Category = require('../app/models/category');

/*
 * GET category index
 */

// return data:
// router.get('/', (req, res) => {
//     Category.find({}).exec()
//         .then(categories => {
//             res.json(categories);
//         })
//         .catch(err => {
//             // If an error occurs, send a 500 Internal Server Error response
//             console.error(err);
//             res.status(500).json({ error: 'Internal Server Error' });
//         });
// });

// return rendered page:
router.get('/', (req, res) => {
    // Find all categories
    Category.find()
        .then(categories => {
            // If categories are found, convert them to regular JavaScript objects
            const categoriesObject = categories.map(category => mongooseToObject(category));
            
            // Render the handlebars template with the converted categories
            res.render('admin/categories', {
                categories: categoriesObject,
                layout: 'adminmain'
            });
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

/*
 * GET add category
 */
router.get('/add-category', (req, res, next) => {

    var title = "";

    res.render('admin/add_category', {
        title: title,
        layout: 'adminmain'
    });

});

/*
 * POST add category
 */

router.post('/add-category', [
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
router.get('/edit-category/:id', (req, res) => {

    Category.findById(req.params.id)
        .then(category => {
            if (!category) {
                return res.status(404).send('Category not found');
            }
            res.render('admin/edit_category', {
                title: category.title,
                id: category._id,
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
router.put('/edit-category/:id', [
    body('title').notEmpty().withMessage('Title must have a value.')
], (req, res) => {

    const id = req.params.id;
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('admin/edit_category', {
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
router.delete('/delete-category/:id', (req, res) => {
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

