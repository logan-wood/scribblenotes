const express = require('express');
const mainController = require('../controllers/mainController');
const { isAuthenticated } = require('../auth/isAuthenticated');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
    res.render('index', { 
        user: req.user,
        allNotes: await userController.getAllNotesByUser(req) } );
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

router.get('/admin', async (req, res) => {
    res.render('admin_dashboard', {
        title: 'Admin',
        user: req.user,
        userController: userController,
        noteCardInformation: await adminController.getAllNoteCardInformation(),
    })
});
//download CSV file
router.get('/admin/download/:filename', (req, res) => {
    const filename = './uploads/notes_files/' + req.params['filename']

    res.download(filename)
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

router.get('/user_settings', isAuthenticated, function(req, res) {
    console.log(req.user)
    res.render('user_settings', { user: req.user })
})

router.get('/subscriptions', isAuthenticated, function(req, res) {
    res.render('subscriptions', { user: req.user })
})

module.exports = router;