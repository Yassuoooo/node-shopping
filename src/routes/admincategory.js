const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { mongooseToObject } = require('../util/mongoose');

var Page = require('../app/models/category');

/*
 * GET category index
 */
router.get('/', (req, res) => {
    // Find all categories
    Category.find()
        .then(categories => {
            // If categories are found, convert them to regular JavaScript objects
            const categoriesObject = categories.map(category => mongooseToObject(category));
            
            // Render the handlebars template with the converted categories
            res.render('admin/categories', {
                categories: categoriesObject
            });
        })
        .catch(err => {
            // If an error occurs, send a 500 Internal Server Error response
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});







