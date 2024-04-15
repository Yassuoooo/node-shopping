class AdminController {
    // function constructor

    // GET /news: cấu hình cho route news
    index(req, res) {
        res.render('admin/adminhome', {
            layout: 'adminmain'
        });
    }

}

module.exports = new AdminController(); 