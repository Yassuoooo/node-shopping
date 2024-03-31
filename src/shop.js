const path = require('path');
const express = require('express'); // khởi tạo express và import express
const handlebars = require('express-handlebars').engine;
const bodyParser = require('body-parser');
var session = require('express-session');
const { body } = require('express-validator');
const methodOverride = require('method-override');

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

// Routes:

// Static file:
//app.use(express.static(path.join(__dirname, 'public'))) // lấy các file trong thư mục public

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('_method')); // tạo _method và dùng methodOverride để thực hiện ghi đè method 


app.engine(
    'hbs',
    handlebars({
        extname: '.hbs', // config lại tên của handlebars
        helpers: {
          eq: function(a, b, options) {
              return a === b ? options.fn(this) : options.inverse(this);
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
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))


// Express validator:

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