// Import các route children:
const homeRouter = require('./home'); 
const adminHomeRouter = require('./adminhome');
const addPageAdminRouter = require('./adminpage');


// Route parent chung:
function route(app) {
    // tạo hàm route và truyền vào instance app của express

    app.use('/home', homeRouter); // truyền vào path và function handler

    app.use('/adminhome', adminHomeRouter);

    app.use('/adminpage', addPageAdminRouter);
    
}

module.exports = route; // export route ra ngoài để index.js ở ngoài có thể sử dụng
