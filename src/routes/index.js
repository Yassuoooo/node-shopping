
// Import các route children:
const adminRouter = require('./admin'); 
const homeRouter = require('./home'); 


// Route parent chung:
function route(app) {


    // admin mvc:
    app.use('/admin', adminRouter);
    

    // user mvc:
    app.use('/', homeRouter);

    
}

module.exports = route; // export route ra ngoài để index.js ở ngoài có thể sử dụng
