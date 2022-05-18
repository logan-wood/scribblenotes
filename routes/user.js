const express = require('express');
const userController = require('../controllers/userController');
const passport = require('passport');
const db = require('../db');
const crypto = require('crypto')

const router = express.Router(); 

router.post('/register', userController.register);
router.post('/login',  passport.authenticate('local', {
    failureRedirect: '/',
}), function(req, res) {
    res.redirect('/')
});

router.post('/forgot_password', async (req, res) => {
    const user = await userController.getUserfromEmail(req.body.email);
    const user_id = user.user_id;
    var uuid = crypto.randomUUID();
    
    db.query('SELECT user_id FROM users WHERE email = ?', req.body.email, function(error, result) {
        //error handling
        if (error) throw error;

        //no email found
        if (!result) {
            res.send('No matching email was found in our systems');
        } else {
            db.query('INSERT INTO reset_password SET ?', {uuid: uuid, user_id: user_id}, function(error) {
                if (error) throw error;

                res.redirect('/reset_password/' + uuid)
            })
        }
    });
});
router.post('/reset_password/:uuid', userController.changePassword);

module.exports = router;