const express = require('express');
const userController = require('../controllers/userController');
const passport = require('passport');

const router = express.Router(); 

router.post('/register', userController.register);
router.post('/login',  passport.authenticate('local', {
    failureRedirect: '/',
}), function(req, res) {
    res.redirect('/')
});

router.post('/forgot_password', userController.sendPasswordReset);
router.post('/reset_password/:uuid', userController.changePassword);
router.post('/delete_notification', userController.deleteNotification);
router.post('/change_username', userController.changeUsername);
router.post('/clear_notifications', userController.clearNotifications);

module.exports = router;