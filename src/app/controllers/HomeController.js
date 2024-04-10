
class HomeController {
    // function constructor

    // GET /news: cấu hình cho route news
    index(req, res) {
        res.render('home');
    }
    // about(req, res) {
    //     res.render('about');
    // }
    // services(req, res) {
    //     res.render('services');
    // }
    // blog(req, res) {
    //     res.render('blog');
    // }
    // contact(req, res) {
    //     res.render('contact');
    // }

}

module.exports = new HomeController(); 
