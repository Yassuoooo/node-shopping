const express = require('express');
const router = express.Router();
const AccountModel = require('../app/models/account');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


router.get('/login_required', (req, res) => {
    res.render('account/login_required', { title: 'login required', layout: 'accountmain' });
})

router.get('/login', (req, res) => {
    res.render('account/login', { title: 'Login', layout: 'accountmain' });
})

router.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    AccountModel.findOne({ 
        username: username, password: password
     })
     .then(data=> {
        if (data) {
            var token = jwt.sign({
                _id: data._id,
                username: data.username, // Thêm thông tin username vào payload của token
                role: data.role,
                email: data.email
            }, 'pass')

            if (data.role === 'admin') {
                // Nếu role của người dùng là admin, chuyển hướng tới trang adminhome
                return res.json({
                    message: 'done',
                    token: token,
                    redirect: '/admin'
                });
            } else if (data.role === 'user') {
                // Nếu role của người dùng là user, chuyển hướng tới trang home
                return res.json({
                    message: 'done',
                    token: token,
                    redirect: '/home'
                });
            }
        } else {
            return res.json('login failure');
        }
     })
     .catch(err => {
        console.log(err);
        res.status(500).json('server error');
    })
})

router.get('/register', (req, res) => {
    res.render('account/register', { title: 'Register', layout: 'accountmain' });
})

router.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // Kiểm tra xem tài khoản đã tồn tại chưa
    AccountModel.findOne({ username })
        .then(existingAccount => {
            if (existingAccount) {
                return res.status(400).json({ message: 'Username already exists' });
            } else {
                // Tạo một tài khoản mới
                const newAccount = new AccountModel({ username, password, email });

                // Lưu tài khoản vào cơ sở dữ liệu
                newAccount.save()
                    .then(savedAccount => {
                        // Tạo token cho tài khoản mới đăng ký
                        const token = jwt.sign({ _id: savedAccount._id }, 'pass');

                        // Trả về thông điệp và token cho client
                        return res.json({ message: 'Registration successful', token });
                    })
                    .catch(err => {
                        console.error(err);
                        return res.status(500).json({ message: 'Server error' });
                    });
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        });
});

router.get('/account-info', async (req, res) => {
    try {
        // Lấy thông tin tài khoản từ token được gửi trong yêu cầu
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/account/login_required');
        }

        // Xác minh và giải mã token để lấy thông tin tài khoản
        const decodedToken = jwt.verify(token, 'pass');
        const accountId = decodedToken._id;

        // Tìm kiếm tài khoản trong cơ sở dữ liệu
        const account = await AccountModel.findById(accountId).select('username email role');

        if (!account) {
            return res.status(404).render('error', { message: 'Account not found' });
        }

        // Render trang account_info và truyền thông tin tài khoản vào template
        res.render('account-info', {
            title: 'Account Information',
            username: account.username,
            email: account.email,
            role: account.role,
            isLoggedIn: true, // Truyền trạng thái đăng nhập
            layout: 'accountmain'
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' });
    }
});

router.get('/logout', (req, res) => {
    // Xóa cookie token
    res.clearCookie('token');

    // Chuyển hướng người dùng đến trang đăng nhập hoặc trang chính
    res.redirect('/account/login');
});

module.exports = router;
