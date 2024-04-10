// Import các route children:
const homeRouter = require('./home'); 
const adminHomeRouter = require('./adminhome');
const pageAdminRouter = require('./adminpage');
const categoryAdminRouter = require('./admincategory');
const productAdminRouter = require('./adminproduct');
const pagesRouter = require('./pages');
const productRouter = require('./product');
const cartRouter = require('./cart');



// Route parent chung:
function route(app) {
    // tạo hàm route và truyền vào instance app của express

    //app.use('/home', homeRouter); // truyền vào path và function handler

    app.use('/adminhome', adminHomeRouter);

    app.use('/adminpage', pageAdminRouter);

    app.use('/admincategory', categoryAdminRouter);

    app.use('/adminproduct', productAdminRouter);
    
    app.use('/products', productRouter);

    app.use('/cart', cartRouter);

    app.use('/', pagesRouter);

    
    
}

module.exports = route; // export route ra ngoài để index.js ở ngoài có thể sử dụng
