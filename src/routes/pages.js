
const express = require('express');
const router = express.Router(); 


var Page = require('../app/models/page');

// GET trang chủ
router.get('/', (req, res) => {
    Page.findOne({ slug: 'home' })
        .then(page => {
            if (!page) {
                //console.log("Trang không tồn tại.");
                res.status(404).send("Trang không tồn tại.");
            } else {
                res.render('home', {
                    title: page.title,
                    content: page.content,
                    layout: 'main'
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        });
});

// GET một trang bất kỳ dựa trên slug
router.get('/:slug', (req, res) => {
    const slug = req.params.slug;

    Page.findOne({ slug: slug })
        .then(page => {
            if (!page) {
                console.log("Trang không tồn tại.");
                res.status(404).send("Trang không tồn tại.");
            } else {
                res.render('home', {
                    title: page.title,
                    content: page.content,
                    layout: 'main'
                });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Lỗi máy chủ nội bộ.");
        });
});


module.exports = router;
