const path = require('path');
const express = require('express'); // khởi tạo express và import express
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');
const methodOverride = require('method-override');
//var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
const mkdirp = require('mkdirp');
const { mongooseToObject } = require('./util/mongoose');

const app = express(); // dùng express cho app nodejs
const port = 3000; // tạo port 3000 để sử dụng
 
// Import routes:
const route = require('./routes');

// Import DbConnection:
const db = require('./config/db');

// Connect to database:
db.connect();

// Sử dụng express-validator middleware
app.use(body());

// Express fileUpload middleware
app.use(fileUpload());

app.use(cookieParser());



// Get Page model
const Page = require('./app/models/page');
// Định nghĩa route GET để lấy tất cả các trang
// Middleware để lấy tất cả các trang và thêm chúng vào context
app.use((req, res, next) => {
    Page.find({}).sort({ sorting: 1 }).exec()
        .then(pages => {
            // Nếu có các trang được tìm thấy, chuyển đổi chúng thành các đối tượng JavaScript thông thường
            const pagesObject = pages.map(page => mongooseToObject(page));
            // Thêm pages vào context
            res.locals.pages = pagesObject;
            // Chuyển sang middleware tiếp theo
            next();
        })
        .catch(err => {
            // Nếu có lỗi, gửi mã lỗi 500 Internal Server Error
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Sử dụng template adminheader
app.get('/adminheader', (req, res) => {
    res.render('adminheader', {
        layout: 'adminmain'
    });
});

app.get('/header', (req, res) => {
    res.render('header', {
        layout: 'main'
    });
});


const Category = require('./app/models/category');
// Middleware để lấy tất cả các danh mục và thêm chúng vào context
app.use((req, res, next) => {
    Category.find({}).exec()
        .then(categories => {
            // Nếu có các trang được tìm thấy, chuyển đổi chúng thành các đối tượng JavaScript thông thường
            const categoriesObject = categories.map(category => mongooseToObject(category));
            // Thêm pages vào context
            res.locals.categories = categoriesObject;
            // Chuyển sang middleware tiếp theo
            next();
        })
        .catch(err => {
            // Nếu có lỗi, gửi mã lỗi 500 Internal Server Error
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


// Routes:

// Static file:
app.use(express.static(path.join(__dirname, 'public'))) // lấy các file trong thư mục public
//app.use(express.static('public'));

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('_method')); // tạo _method và dùng methodOverride để thực hiện ghi đè method 


app.engine(
    'hbs',
    handlebars({
        extname: '.hbs', // config lại tên của handlebars
        helpers: {
        // eq: function(a, b, options) {
        //       return a === b ? options.fn(this) : options.inverse(this);
        // },
        eq: function(a, b, options) {
            if (options && typeof options.fn === 'function' && typeof options.inverse === 'function') {
                return a === b ? options.fn(this) : options.inverse(this);
            }
            return a === b;
        },
        
        ifCond: function(v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
                }
        },
        formatPrice: function(price) {
            if (typeof price !== 'undefined' && !isNaN(price)) {
                return parseFloat(price).toFixed(2);
            } else {
                return "";
            }
        },
        formatCurrency: function(value) {
            return parseFloat(value).toFixed(2);
        },
        unless: function (a, options) {
            return a ? options.inverse(this) : options.fn(this);
        },
        calculate: function(a, operator, b) {
            switch (operator) {
                case '+':
                    return a + b;
                case '-':
                    return a - b;
                case '*':
                    return a * b;
                case '/':
                    return a / b;
                default:
                    throw new Error("Unsupported operator: " + operator);
            }
        },
        // sum: function(array) {
        //     return array.reduce((acc, val) => acc + val, 0);
        // },
        calculateSubtotal: function(price, qty) {
            return (parseFloat(price) * qty).toFixed(2);
        },
        toFixed: function(value, decimalPlaces) {
            if (typeof value === 'number' && typeof decimalPlaces === 'number') {
                return value.toFixed(decimalPlaces);
            }
            return '';
        },
        assign: function (varName, varValue, options) {
            options.data.root[varName] = varValue;
        },
        pushArray: function(value, options) {
            options.data.root.subtotals = [value];
        },
        calculateTotal: function(cart) {
            let total = 0;
            cart.forEach(function(item) {
                total += parseFloat(item.price) * item.qty;
            });
            return total.toFixed(2);
        },
        add: function(num1, num2) {
            return num1 + num2;
        },
        json: function (context) {
            return JSON.stringify(context);
        },
        inc: function(value, options) {
            return parseInt(value) + 1;
        }
      }
    }),
) 

app.set('view engine', 'hbs') // dùng tên mới
app.set('views', path.join(__dirname, 'resources', 'views')) // đặt đường dẫn cho view đến thư mục views của blog


// Body Parser:
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// Express Session:
const CryptoJS = require('crypto-js');

// Tạo một chuỗi ngẫu nhiên có độ dài 32 ký tự
const secretKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);

console.log(secretKey);


// Cấu hình express-session
app.use(session({
    secret: secretKey, // Chuỗi bí mật để ký và mã hóa cookie session
    resave: true, // Không lưu lại phiên mỗi lần yêu cầu
    saveUninitialized: true // Không lưu phiên cho các yêu cầu không được khởi tạo
}));



// Express validator:
// app.use(expressValidator({
//   customValidators: {
//       isImage: function(value, { req, location, path }) {
//           if (!req.files) {
//               return false;
//           }
//           const filename = req.files.image.name;
//           const extension = path.extname(filename).toLowerCase();
//           switch (extension) {
//               case '.jpg':
//               case '.jpeg':
//               case '.png':
//                   return true;
//               default:
//                   return false;
//           }
//       }
//   },
//   // errorFormatter is deprecated in express-validator v5.3.0
//   // Use customSanitizers or customValidators instead
// }));



// Express message:
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
}) // arrow function

// Routes:
route(app) // gọi route và truyền vào app