
class HomeController {
    // function constructor

    // GET /news: cấu hình cho route news
    index(req, res) {
        res.render('home');
    }

}

module.exports = new HomeController(); 
