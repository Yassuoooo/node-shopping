
const express = require('express');
const router = express.Router(); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


var checkAdminHome = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            return res.json('login required');
        }

        var decoded = jwt.verify(token, 'pass');
        var role = decoded.role;
        
        if (role === 'admin') { 
            next();
        } else { 
            res.redirect('/account/notpermitted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}

var checkAdminPage = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            return res.json('login required');
        }

        var decoded = jwt.verify(token, 'pass');
        var role = decoded.role;
        
        if (role === 'admin') { 
            next();
        } else { 
            res.redirect('/account/notpermitted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}

var checkAdminCategory = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            return res.json('login required');
        }

        var decoded = jwt.verify(token, 'pass');
        var role = decoded.role;
        
        if (role === 'admin') { 
            next();
        } else { 
            res.redirect('/account/notpermitted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}

var checkAdminProduct = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            return res.json('login required');
        }

        var decoded = jwt.verify(token, 'pass');
        var role = decoded.role;
        
        if (role === 'admin') { 
            next();
        } else { 
            res.redirect('/account/notpermitted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}

var checkAdminOrderProduct = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            return res.json('login required');
        }

        var decoded = jwt.verify(token, 'pass');
        var role = decoded.role;
        
        if (role === 'admin') { 
            next();
        } else { 
            //res.json('not permitted');
            res.redirect('/account/notpermitted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}

var checkAdminUsers = (req, res, next) => {
    try {
        var token = req.cookies.token;
        if (!token) {
            return res.json('login required');
        }

        var decoded = jwt.verify(token, 'pass');
        var role = decoded.role;
        
        if (role === 'admin') { 
            next();
        } else { 
            //res.json('not permitted');
            res.redirect('/account/notpermitted');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json('server error');
    }
}

module.exports = checkAdminHome;
module.exports = checkAdminPage;
module.exports = checkAdminCategory;
module.exports = checkAdminProduct;
module.exports = checkAdminOrderProduct;
module.exports = checkAdminUsers;


