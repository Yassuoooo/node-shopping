
const jwt = require('jsonwebtoken');


var checkLogin = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            //return res.json('unallowed');
            //res.locals.loggedIn = false; // Người dùng chưa đăng nhập
            return res.redirect('/login_required');
        }

        jwt.verify(token, 'pass', (err, decoded) => {
            if (err) {
                //res.locals.loggedIn = false; // Người dùng chưa đăng nhập
                return res.status(500).json('invalid token');
            }

            // Truy cập thông tin người dùng từ payload của token
            var userId = decoded._id;
            var username = decoded.username;
            var email = decoded.email;


            // Gán thông tin người dùng vào request để có thể sử dụng trong các middleware hoặc routes khác
            req.userId = userId;
            req.username = username;
            req.email = email;

            
            // Tiếp tục middleware tiếp theo hoặc xử lý routes
            next();
        });
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}



module.exports = checkLogin;
