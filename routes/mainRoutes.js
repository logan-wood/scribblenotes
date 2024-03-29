const express = require('express');
const mainController = require('../controllers/mainController');
const { isAuthenticated } = require('../auth/isAuthenticated');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { response } = require('express');
const router = express.Router();
const open = require('open')

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
        title: 'scribblenotes',
        errors: req.flash('signup_error')
     });
});

router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'scribblenotes',
        errors: req.flash('login')
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


router.get('/new_note', isAuthenticated, async (req, res) => {
    res.render('new_note', { 
        user: req.user,
        isAdmin: userController.isAdmin(req),
        allRecipients: await userController.getAllRecipentsByUser(req)
    });
});
router.post('/new_note', isAuthenticated, mainController.newNote);
//csv automatically generated
router.post('/new_note_autogen', isAuthenticated, mainController.newNoteAutoGen);


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
            totalSubscriptions: await adminController.readTotalSubscriptions(),
            filter: req.query.filter || null
        })
    } else {
        res.redirect('/')
    }
});
//download CSV file
router.get('/admin/download/:filename', (req, res) => {
    const filename = req.params['filename'];
    
    open('https://scribblecsvstorage.blob.core.windows.net/uploads/' + filename, function(err) {
        if (err) throw err;
    });

    res.redirect('/admin');
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

router.get('/verify_account/:uuid', function(req, res) {
    res.render('verify_account', { 
        uuid: req.params['uuid'],
    })
});

module.exports = router;