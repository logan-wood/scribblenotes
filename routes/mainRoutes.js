const express = require('express');
const mainController = require('../controllers/mainController');
const { isAuthenticated } = require('../auth/isAuthenticated');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { response } = require('express');
const router = express.Router();

router.get('/', isAuthenticated, async (req, res) => {
    res.render('index', { 
        user: req.user,
        allNotes: await userController.getAllNotesByUser(req),
        allCampaigns: await userController.getAllCampaignsByUser(req),
        notifications: await userController.getUserNotifications(req),
        isAdmin: userController.isAdmin(req),
        errors: req.flash('password_reset_sent')
    });
});

router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'scribblenotes'
     });
});

router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'scribblenotes',
        errors: req.flash('password_reset_sent')
    });
});

router.get('/forgot_password', (req, res) => {
    res.render('forgot_password', {
        title: 'scribblenotes',
        errors: req.flash('no_email_found')
    });
}); router.get('/reset_password/:uuid', (req, res) => {
    res.render('reset_password', {
        uuid: req.params['uuid'],
    })
});


router.get('/new_note', isAuthenticated, (req, res) => {
    res.render('new_note', { 
        user: req.user,
        isAdmin: userController.isAdmin(req)
    });
});
router.post('/new_note', isAuthenticated, mainController.newNote);


router.get('/new_campaign', isAuthenticated, (req, res) => {
    res.render('new_campaign', {
        user: req.user,
        isAdmin: userController.isAdmin(req)
    });
})
router.post('/new_campaign', isAuthenticated, mainController.newCampaign);

router.get('/admin', isAuthenticated, async (req, res) => {
    if (userController.isAdmin(req)) {
        res.render('admin_dashboard', {
            title: 'Admin',
            user: req.user,
            userController: userController,
            noteCardInformation: await adminController.getAllNoteCardInformation(),
            completedNoteCardInformation: await adminController.getAllCompletedNoteCardInformation(),
            campaignCardInformation: await adminController.getAllCampaignCardInformation(),
            completedCampaignCardInformation: await adminController.getAllCompletedCampaignCardInformation(),
            notifications: await userController.getUserNotifications(req),
            isAdmin: userController.isAdmin(req),
            totalSubscriptions: await adminController.readTotalSubscriptions()
        })
    } else {
        res.redirect('/')
    }
});
//download CSV file
router.get('/admin/download/:filename', (req, res) => {
    const filename = './uploads/notes_files/' + req.params['filename']

    res.download(filename)
})

router.get('/contact', (req, res) => {
    res.render('contact', { 
        title: 'scribblenotes',
        user: req.body.user,
        isAdmin: userController.isAdmin(req)
    });
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/user_settings', isAuthenticated, function(req, res) {
    res.render('user_settings', { 
        user: req.user,
        isAdmin: userController.isAdmin(req) 
    })
})

router.get('/subscriptions', function(req, res) {
    if (req.user) {
        res.render('subscriptions', { 
            user: req.user,
            subscription: req.user.subscription,
            isAdmin: userController.isAdmin(req)
        })
    } else {
        res.render('subscriptions', {
            user: req.user,
            subscription: 'none'
        })
    }
})

router.get('/confirmation_message', function(req, res) {
    res.render('blank_card')
})

module.exports = router;