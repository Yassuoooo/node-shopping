const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


var AccountModel = require('../app/models/account');


var checkLogin = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            //return res.json('unallowed');
            //res.locals.loggedIn = false; // Người dùng chưa đăng nhập
            return res.redirect('/account/login_required');
        }

        jwt.verify(token, 'pass', (err, decoded) => {
            if (err) {
                //res.locals.loggedIn = false; // Người dùng chưa đăng nhập
                return res.status(500).json('invalid token');
            }

            // Truy cập thông tin người dùng từ payload của token
            var userId = decoded._id;
            var username = decoded.username;

            // Gán thông tin người dùng vào request để có thể sử dụng trong các middleware hoặc routes khác
            req.userId = userId;
            req.username = username;
            
            // Tiếp tục middleware tiếp theo hoặc xử lý routes
            next();
        });
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}


// var checkLogin = (req, res, next) => {
//     try {
//         var token = req.cookies.token; // Sửa từ req.headers.cookie thành req.headers.token
//         if (!token) {
//             return res.redirect('/account/login_required');
//         }

//         var decodeToken = jwt.verify(token, 'pass');
        
//         // Tìm người dùng trong cơ sở dữ liệu dựa trên ID được giải mã từ token
//         AccountModel.findById(decodeToken._id)
//             .then(function (data) {
//                 if (!data) {
//                     return res.redirect('/account/login_required');
//                 } else {
//                     // Lưu thông tin người dùng vào req để sử dụng trong các middleware và route tiếp theo
//                     req.userData = data;
//                     next();
//                 }
//             })
//             .catch(err => {
//                 console.error(err);
//                 return res.status(401).json({
//                     error: true,
//                     message: 'Invalid or expired token'
//                 });
//             });
//     } catch (error) {
//         console.error(error);
//         return res.status(401).json({
//             error: true,
//             message: 'Invalid token'
//         });
//     }
// };


module.exports = checkLogin;
