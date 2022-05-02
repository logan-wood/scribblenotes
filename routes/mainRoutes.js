const express = require('express');
const mainController = require('../controllers/mainController');
const { isAuthenticated } = require('../auth/isAuthenticated');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.user});
});

router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'scribblenotes'
     });
});

router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'scribblenotes'
     });
});


router.get('/new_note', isAuthenticated, (req, res) => {
    res.render('new_note', { user: req.user });
});
router.post('/new_note', isAuthenticated, mainController.fileUpload, function(req, res) {
    console.log(req.user)
});

router.get('/about', (req, res) => {
    res.render('about', { 
        title: 'scribblenotes',
        user: req.body.user
     });
});

router.get('/settings',isAuthenticated, (req, res) => {
    res.render('settings', { 
        title: 'Settings',
        user: req.user
     });
});

router.get('/admin', async (req, res) => {
    res.render('admin_dashboard', {
        title: 'Admin',
        user: req.user,
        userController: userController,
        noteCardInformation: await adminController.getAllNoteCardInformation()
    })
});
//download
router.get('/admin/:filename', (req, res) => {
    const filename = __dirname + '\\uploads\\notes_files\\' + req.params.filename

    console.log('yess')
    console.log(filename)

    res.download(filename)
    res.redirect('/admin')
})


router.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'scribblenotes',
        user: req.body.user
     });
});

router.get('/logout', function(req, res, next) {
    console.log('hi');
    req.logout();
    res.redirect('/');
});

module.exports = router;