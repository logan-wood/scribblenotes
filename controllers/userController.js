const db = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { raw } = require('body-parser');
const e = require('connect-flash');


//code for login is in auth/passport.js

// logout user and redirect to homepage
exports.logout = (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}

exports.register = (req, res) => {
    console.log(req.body);
    
    const {username, email, password, password2} = req.body;
    let errors = [];


    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if(error){
            console.log(error);
        }

        if(result.length > 0){
            // errors.push({ msg: 'This email is already in use'});
            // res.render('register', {
            //     errors
            // });
            req.flash('signup_error', 'Email is already in use');
            res.redirect('/register')
        } else if(password !== password2){
            // errors.push({ msg: 'Passwords do not match'});
            // res.render('register', {
            //     errors
            // }); 
            req.flash('signup_error', 'Passwords Do Not Match');
            res.redirect('/register')
        }
        
        //hash pasword and create user
        if (result.length == 0 & password == password2) {
            //salt for hashed password
            const saltRounds = 10;

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    db.query('INSERT INTO users set ?', {username: username, email: email, password: hash, }, (error, result) => {

                        if(error){
                            console.log(error);
                        } else {
                            // emailService(email, 'Verify Account')

                            //send email verification
                            const verification_id = crypto.randomUUID();

                            db.query('INSERT INTO verification SET ?', {verification_id: verification_id, user_id: result.insertId}, function(err) {
                                if (err) throw err;

                                emailService(email, 'Verify Account', 'Visit this link to verify your email: ' + process.env.DOMAIN + 'verify_account/' + verification_id + "/" + result.insertId)
                            })

                            req.flash('login', 'Your account has been successfully created.');
                            res.redirect('/');
                        }
                    })
                });
            });
        }
    });    
}

exports.changePassword = async (req, res) => {
    const password = req.body.password;
    const password2 = req.body.password2;
    const uuid = req.params['uuid']
    const user = await this.getUserfromEmail(req.body.email)
    const user_id = user.user_id
    let errors = [];

    //check uuid matches email
    db.query('SELECT * FROM reset_password where uuid = ? AND user_id = ?', [ uuid, user_id ], function(error, result) {
        if (error) throw error

        if (result.length > 0) {
            //hash pasword and create user
            if (password == password2) {
                //salt for hashed password
                const saltRounds = 10;

                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(password, salt, function(err, hash) {
                        //change password
                        db.query('UPDATE users SET password = ? WHERE email = ?', [hash, req.body.email], (error, result) => {
                            if(error) throw error;

                            //delete correlating reset_password database row
                            db.query('DELETE FROM reset_password WHERE uuid = ?', [uuid], function(error) {
                                if (error) throw error;

                                console.log('reset password database record deleted')
                            })

                            req.flash('login', 'Your password has been reset.')

                            res.redirect('/');
                        })
                    });
                });
            } else {
                res.send('Passwords do not match')
            }
        } else {
            res.send('Invalid email entered')
        }
    })
}

exports.getUserFromID = async (user_id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE user_id = ?', [user_id], function(error, result) {
            if (error) { return reject(error) }
            
            return resolve(result[0]);
        })
    })

}

exports.getUserfromEmail = async (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], function(error, result) {
            if (error) { return reject(error) }

            return resolve(result[0]);
        })
    })
}

//User Dashboard
exports.getAllNotesByUser = async (req) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM notes WHERE user_id = ?', [req.user.id], function(error, results) {
            if (error) return reject(error);
            
            if (results.length == 0) {
                return resolve(null);
            } else {
                return resolve(results);
            }
        })
    })
}

exports.getAllCampaignsByUser = async (req) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM campaigns WHERE user_id = ?', [req.user.id], function(error, results) {
            if (error) return reject(error);
            
            if (results.length == 0) {
                return resolve(null);
            } else {
                return resolve(results);
            }
        })
    })
}

exports.isAdmin = (req) => {
    if (req.user.is_admin === 1) {
        return true
    }

    return false;
}

exports.createNotification = (user_id, name, message) => {
    db.query('INSERT INTO notifications SET ?', {user_id: user_id, name: name, message: message}, function(error) {
        if (error) throw error;
    });
}

exports.clearNotifications = (req, res) => {
    db.query('DELETE FROM notifications WHERE user_id = ?', req.user.id, function(err) {
        if (err) throw err;

        res.redirect('/');
    })
}

exports.deleteNotification = (req, res) => {
    const notification_id = req.body.notification_id;

    if (notification_id) {
        db.query('DELETE FROM notifications WHERE notification_id = ?', notification_id, function(error) {
            if (error) throw error;

            res.end();
        })
    }

    res.end()
}

exports.getUserNotifications = (req) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM notifications WHERE user_id = ?', [req.user.id], function(error, results) {
            if (error) return reject(error);
            
            if (results.length == 0) {
                return resolve(null);
            } else {
                return resolve(results);
            }
        })
    })
}

exports.changeUsername = (req, res) => {
    db.query('UPDATE users SET username = ? WHERE user_id = ?', [req.body.username, req.user.id], function(error) {
        if (error) throw error

        res.redirect('/logout')
    });
}

exports.sendPasswordReset = async (req, res) => {
    const user = await exports.getUserfromEmail(req.body.email);
    
    var user_id
    if (user) {
        user_id = user.user_id;
    } else {
        req.flash('no_email_found', 'No matching email was found')
        res.redirect('/forgot_password');
        return;
    }
    var uuid = crypto.randomUUID();
    
    db.query('SELECT user_id FROM users WHERE email = ?', req.body.email, function(error, result) {
        //error handling
        if (error) throw error;

        //no email found
        if (!result) {
            req.flash('no_email_found', 'No matching email was found');
        } else {
            db.query('INSERT INTO reset_password SET ?', {uuid: uuid, user_id: user_id}, function(error) {
                if (error) throw error;

                emailService(req.body.email, 'Password reset link', 'Visit this link to reset your password: ' + process.env.DOMAIN + 'reset_password/' + uuid)
                exports.createNotification(user_id, 'Reset Password', 'A link to reset your password has been sent to your email')

                req.flash('login', 'A password reset link has been sent to your email');
                res.redirect('/')
            })
        }
    });
}

exports.verifyAccount = (req, res) => {
    const verification_uuid = req.body.uuid;
    console.log(verification_uuid)
    let user_id

    db.query('SELECT * FROM verification WHERE verification_id = ?', verification_uuid, function(err, result) {
        if (err) {
            res.send('There was a problem verifying your account');

            throw err;
        }

        console.log(result)

        if (result) {
            user_id = result[0].user_id

            console.log(user_id)

            db.query('UPDATE users SET is_active = 1 WHERE user_id = ?', user_id, function(err) {
                if (err) {
                    res.send('There was a problem verifying your account');

                    throw err;
                };

                console.log('second query cleared')

                //no errors, return user to login page
                req.flash('login', 'Your account has been verified.')
                res.redirect('/')
            })
        } else {
            res.send('No user was found')
        }
    })
}