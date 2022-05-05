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

            //salt for hashed password
            const saltRounds = 10;

            bcrypt.genSalt(saltRounds, function(err, salt) {
                bcrypt.hash(password, salt, function(err, hash) {
                    db.query('INSERT INTO users set ?', {username: username, email: email, password: hash, }, (error, result) => {

                        if(error){
                            console.log(error);
                        } else {
                            console.log(result);
                            errors.push({ msg: 'Success!' });
                            res.render('register', {
                                errors
                            }); 
                        }
                    })
                });
            });
            });
}

exports.getUserFromID = (user_id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE user_id = ?', [user_id], function(error, result) {
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