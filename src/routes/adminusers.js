const express = require('express');
const router = express.Router();
const { mongooseToObject } = require('../util/mongoose');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Import middleware checkLogin và checkAdminRole
const checkLogin = require('../middleware/checklogin');
const checkAdmin = require('../middleware/checkrole');

// Import model của người dùng
const AccountModel = require('../app/models/account');

// Middleware xác thực token
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
 * GET danh sách người dùng
 */

// postman:
router.get('/p-users', (req, res) => {
    // Lấy danh sách tất cả người dùng từ cơ sở dữ liệu
    AccountModel.find({}).exec()
        .then(users => {
            // Trả về danh sách người dùng
            res.status(200).json(users);
        })
        .catch(err => {
            // Nếu có lỗi, trả về thông báo lỗi
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// client:
router.get('/', authenticateToken, checkLogin, checkAdmin, (req, res) => {
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
                isLoggedIn: req.isLoggedIn,
                layout: 'adminmain'
            });
            //console.log(usersArray);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// user id Postman
router.get('/p-userid/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await AccountModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/*
 * GET edit users
 */
router.get('/edit-user/:id', authenticateToken, checkLogin, checkAdmin, (req, res) => {

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
 * PUT edit user
 */

// postman:
router.put('/p-edituser/:id', [
    body('username').notEmpty().withMessage('Username must have a value.'),
    body('email').notEmpty().withMessage('Email must have a value.'),
    body('role').notEmpty().withMessage('Role must have a value.')
], (req, res) => {

    const id = req.params.id;
    const username = req.body.username;
    const email = req.body.email;
    const role = req.body.role;
    const errors = validationResult(req);

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
router.put('/edit-user/:id', [
    body('username').notEmpty().withMessage('Username must have a value.'),
    body('email').notEmpty().withMessage('Email must have a value.'),
    body('role').notEmpty().withMessage('Role must have a value.')
], checkLogin, checkAdmin, (req, res) => {

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
            res.redirect('/adminusers');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
    }

});

/*
 * DELETE remove user
 */

// postman:
router.delete('/p-deleteuser/:id', (req, res) => {
    AccountModel.findOneAndDelete({ _id: req.params.id })
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).send('User not found');
            }
            return AccountModel.find({}).exec();
        })
        .then(users => {
            req.app.locals.users = users;
            res.status(200).json('deleted');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// client:
router.delete('/delete-user/:id', checkLogin, checkAdmin, (req, res) => {
    AccountModel.findOneAndDelete({ _id: req.params.id })
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).send('User not found');
            }
            return AccountModel.find({}).exec();
        })
        .then(users => {
            req.app.locals.users = users;
            res.redirect('/adminusers');
            //res.json('deleted');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

/*
 * Các phương thức khác để thêm, sửa, xóa tài khoản người dùng có thể được thêm vào đây
 */

module.exports = router;
