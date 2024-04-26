
const jwt = require('jsonwebtoken');

var AccountModel = require('../models/account');

class AccountController {

    getloginpage(req, res) { 
        res.render('account/login', { title: 'Login', layout: 'accountmain' });
    }

    postlogin(req, res) { 
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
                        redirect: '/admin/home'
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
    }

    getregisterpage(req, res) { 
        res.render('account/register', { title: 'Register', layout: 'accountmain' });
    }

    postregister(req, res) { 
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
                            return res.status(201).redirect('/login');
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
    }

    async getaccountinfo(req, res) { 
        try {
            // Lấy thông tin tài khoản từ token được gửi trong yêu cầu
            const token = req.cookies.token;
            if (!token) {
                return res.redirect('/login_required');
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
                layout: 'main'
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', { message: 'Server error' });
        }
    }

    getnotpermitted(req, res) { 
        res.render('account/notpermitted', { title: 'notpermitted', isLoggedIn: true, layout: 'main'});
    }

    getloginrequired(req, res) { 
        res.render('account/login_required', { title: 'login required', layout: 'accountmain' });
    }

    getlogout(req, res) { 
        // Xóa cookie token
        res.clearCookie('token');

        // Chuyển hướng người dùng đến trang đăng nhập hoặc trang chính
        res.redirect('/login');
    }

}


module.exports = new AccountController(); 
