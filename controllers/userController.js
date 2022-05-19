const db = require('../db');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

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
            errors.push({ msg: 'This email is already in use'});
            res.render('register', {
                errors
            });  
        } else if(password !== password2){
            errors.push({ msg: 'Passwords do not match'});
            res.render('register', {
                errors
            }); 
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

                            res.redirect('/');
                        })
                    });
                });
            } else {
                console.log('passwords do not match. ');
            }
        } else {
            console.log('uuid did not match email')
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

exports.getUserfromEmail = (email) => {
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